import get from "lodash.get";
import pick from "lodash.pick";
import currencies from "iso-currencies";
import { copyPriceListTemplate } from "../../priceListTemplates/services/copyFromTemplate";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";

import { ChargeDefinitionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListChargeDefinition";
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate.js";
import { priceListStatusUpdates } from "/imports/api/pricelists/services/priceListStatusSrv";
import { PriceRequestSecurity } from "/imports/utils/security";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const currencyCodes = Object.keys(currencies);
const debug = require("debug")("price-request:bid");

/** priceRequest bid service:
 * calculation steps:
 * 1. retrieve my bid (should be present in the priceRequest document)
 * 2.a if no priceListId exists:
 *     - retrieve template
 *     - create priceList document
 *     - link priceListId back in price request
 * 2.b if priceListId exists:
 *     - update the shipments array in the priceList to be sure it is in sync (items can be added)
 */
export const priceRequestBidService = ({
  priceRequest,
  accountId,
  userId
}) => ({
  priceRequest,
  accountId,
  userId,
  customerId: priceRequest.customerId,
  creatorId: priceRequest.creatorId,
  myBidIndex: (priceRequest.bidders || []).findIndex(
    ({ accountId: id }) => id === accountId
  ),
  hasLinkedPriceList: false,
  getMyBid() {
    this.myBid = (this.priceRequest.bidders || [])[this.myBidIndex];
    return this;
  },
  async check() {
    const check = new PriceRequestSecurity(
      { request: this.priceRequest },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "bidOnRequest" }).throw();
    this.hasLinkedPriceList = !!this.myBid.priceListId;
    this.priceListId = this.myBid.priceListId;
    return this;
  },
  getTemplate({ type }) {
    // 1. lookup if there is a fixed template defined (1) on this request (2)general
    this.refPriceListId = get(this.priceRequest, ["settings", "templateId"]);
    if (!this.refPriceListId && type === "spot") {
      this.refPriceListId = "TEMPL:SPOT-SHIPM";
    }

    return this;
  },
  async copyPriceListTemplate({ context }) {
    let customerId;
    let carrierId;
    let creatorId;
    if (context === "bid") {
      ({ customerId } = this); // customerId = price request initiator
      carrierId = this.accountId; // carrierId = bidder account
      ({ creatorId } = this); // creatorId = price request initiator
    }

    // SPOT: SHIPMENT:
    const { items: shipments, _id } = this.priceRequest;

    const title = `PR_${this.priceRequest.ref()}_V${
      this.priceRequest.version
    } by ${this.accountId}`;
    debug("set pricelist title to ", title);
    const settings = get(this.priceRequest, ["settings", "templateSettings"]);

    const srv = copyPriceListTemplate({
      templateId: this.refPriceListId,
      accountId: this.accountId,
      userId: this.userId,
      title
    });
    await srv.getTemplate(); // async
    srv.transform({
      data: {
        priceRequestId: _id,
        customerId,
        carrierId,
        creatorId,
        shipments,
        settings,
        status: "requested" // ! important !!!!!
      }
    });
    await srv.generatePriceList();
    this.priceListId = srv.get();
    return this;
  },
  async linkBid() {
    // 3. store price list ID in the requestDoc
    // - priceList is set with a timeStamp
    // - a {bid: true} flag is set once the priceList is set in "for-approval" (hook)
    await this.priceRequest.update_async({
      [`bidders.${this.myBidIndex}.priceListId`]: this.priceListId,
      [`bidders.${this.myBidIndex}.bidOpened`]: new Date()
    });
    return this;
  },

  async editSimpleBid({ shipmentId, chargeLines = [], notes }) {
    debug("edit simple bid %o", { shipmentId, chargeLines });

    // remove old chargeLines data:
    // just reset the chargeline for the specific shipmentId (do not alter other fields as stamps can be put such as won, etc..)
    const bidItemIndex = (this.myBid.simpleBids || []).findIndex(
      ({ shipmentId: lineShipId }) => lineShipId === shipmentId
    );

    if (bidItemIndex > -1) {
      // ! important that we ensure db simpleBids === array! if not updates might fail
      await this.priceRequest.update({
        [`bidders.${this.myBidIndex}.simpleBids.${bidItemIndex}.chargeLines`]: chargeLines,
        [`bidders.${this.myBidIndex}.simpleBids.${bidItemIndex}.notes`]: notes
      });
    } else {
      await this.priceRequest.push({
        [`bidders.${this.myBidIndex}.simpleBids`]: {
          date: new Date(),
          shipmentId,
          chargeLines,
          notes
        }
      });
    }

    // modify price list structure charges:
    const charges = chargeLines.map(({ amount, chargeId, ...chargeData }) =>
      ChargeDefinitionSchema.clean({
        ...chargeData,
        id: chargeId,
        currency: currencyCodes.includes(amount.unit) ? amount.unit : undefined
      })
    );

    await PriceList._collection.update(
      { _id: this.priceListId },
      { $set: { charges, shipments: this.priceRequest.items } }
    );

    // modify the price list rate items:
    const bulkPriceListRateOp = PriceListRate._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    // remove previous priceRateItems
    await PriceListRate._collection.remove({
      priceListId: this.priceListId,
      rules: [{ shipmentId }]
    });

    chargeLines.forEach(({ chargeId, meta, amount, ...chargeData }) => {
      const cleanedDoc = PriceListRateSchema.clean({
        ...chargeData,
        amount,
        meta: { ...meta, source: "table" }
      });
      debug("insert rate %o", cleanedDoc);
      bulkPriceListRateOp.insert({
        ...cleanedDoc,
        priceListId: this.priceListId,
        rules: [{ shipmentId }],
        rulesUI: { chargeId }
      });
    });

    try {
      const { result = {} } = await bulkPriceListRateOp.execute();
      const cellUpdateResults = pick(result, [
        "ok",
        "nModified",
        "nUpserted",
        "nInserted"
      ]);
      debug({ cellUpdateResults });
    } catch (err) {
      debug(err);
      this.cellUpdateErrors = "Error updating price list rates";
    }

    return this;
  },

  /**
   * will set the pricelist to "for-approval" status and trigger hooks
   * !! for a multibid, each consicutive bid will trigger a
   * */
  async releaseSimpleBid() {
    const priceList = await PriceList.first(this.priceListId, {
      fields: {
        status: 1,
        priceRequestId: 1,
        creatorId: 1
      }
    });
    if (!priceList) throw new Error("linked priceList document does not exist");
    debug(
      "release pricelist for account %o, user %o ",
      this.accountId,
      this.userId
    );
    await priceListStatusUpdates({
      priceList,
      accountId: this.accountId,
      userId: this.userId
    }).release();
    return this;
  },
  async setTimeStamps() {
    if (this.myBid) {
      const { firstSeen } = this.myBid;
      await this.priceRequest.update({
        [`bidders.${this.myBidIndex}.viewed`]: true,
        [`bidders.${this.myBidIndex}.lastSeen`]: new Date(),
        ...(!firstSeen
          ? { [`bidders.${this.myBidIndex}.firstSeen`]: new Date() }
          : undefined)
      });
    }
  },
  async editBid({ update = {} }) {
    const updateObj = {};
    debug("edit bid:%o", update);
    Object.entries(update).forEach(([key, value]) => {
      if (value !== undefined) {
        updateObj[`bidders.${this.myBidIndex}.${key}`] = value;
      }
    });

    if (Object.keys(updateObj).length) {
      await this.priceRequest.update(updateObj);
    }
    return this;
  },
  async setWinLost({ shipmentId, isWinner }) {
    const bidItemIndex = (this.myBid.simpleBids || []).findIndex(
      ({ shipmentId: lineShipId }) => lineShipId === shipmentId
    );
    debug(
      "bidderIndex:",
      this.myBidIndex,
      ", simplebidItemIndex :",
      bidItemIndex,
      ", current length:",
      get(this.myBid, ["simpleBids", "length"])
    );

    // store win /lost and set queueMail flag
    if (bidItemIndex > -1) {
      debug("update simpleBids entry, overwrite last setting if set!");
      this.promise = await PriceRequest._collection.update(
        this.priceRequest._id,
        {
          $unset: {
            [`bidders.${this.myBidIndex}.simpleBids.${bidItemIndex}.${
              isWinner ? "lost" : "won"
            }`]: new Date()
          },
          $set: {
            [`bidders.${this.myBidIndex}.simpleBids.${bidItemIndex}.${
              isWinner ? "won" : "lost"
            }`]: new Date(),

            [`bidders.${this.myBidIndex}.simpleBids.${bidItemIndex}.queueMail`]: new Date()
          }
        }
      );
    } else {
      debug("no simpleBids entry = not participated");

      // this.promise = this.priceRequest.push({
      //   [`bidders.${this.myBidIndex}.simpleBids`]: {
      //     shipmentId,
      //     [isWinner ? "won" : "lost"]: new Date(),
      //     queueMail: new Date(),
      //     date: new Date()
      //   }
      // });
    }
    return this;
  },
  get() {
    return this.priceListId;
  },
  getPriceRequest() {
    return this.priceRequest;
  }
});
