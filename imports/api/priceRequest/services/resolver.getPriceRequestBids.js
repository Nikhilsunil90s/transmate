import get from "lodash.get";
import { PriceRequest } from "../PriceRequest";
import SecurityChecks from "/imports/utils/security/_security";
import { getRoleInRequest } from "/imports/utils/security/checkUserPermissionsForRequest";
import { DEFAULT_TEMPLATE_ID } from "/imports/api/_jsonSchemas/enums/priceRequest";
import { priceListTemplateSrv } from "/imports/api/priceListTemplates/services/priceListTemplate";

// const debug = require("debug")("price-request:resolver");

/** maps the pricelist template charges to chareLines
 * converts charges.id -> chargelines.chargeId
 */
function prepareChargeLines(charges) {
  return charges.map(
    ({ unit = "EUR", costId, name, id: chargeId, comment }) => ({
      chargeId,
      name,
      costId,
      comment,
      amount: {
        value: 0,
        unit
      }
    })
  );
}

/** loadSimpleBidLines
 * checks if bidder has done a bidding entry (chargelines)
 * if chargeline data -> use
 * if no chargeline data -> get the items from the settings
 * combine the 2 to get a single [] with filled in items and empty items.
 */
async function loadSimpleBidLines({ priceRequest, myBid }) {
  const templateId =
    get(priceRequest, ["settings", "templateId"]) || DEFAULT_TEMPLATE_ID;
  const { charges = [], settings = {} } =
    (await priceListTemplateSrv({ accountId: priceRequest.customerId }).get({
      templateId,
      options: { minimal: true }
    })) || {};

  const emptyChargeLines = prepareChargeLines(charges);

  // for all items in the request, check if we have an entry
  const simpleBids = (priceRequest.items || [])
    .map(({ shipmentId }) => {
      const curBid = (myBid.simpleBids || []).find(
        ({ shipmentId: id }) => id === shipmentId
      );

      return (
        curBid || { shipmentId, chargeLines: emptyChargeLines, offered: false }
      );
    })
    .map(bid => ({
      ...bid,
      settings: {
        ...settings,
        ...get(priceRequest, ["settings", "templateSettings"], {})
      }
    }));
  return simpleBids;
}

export const getPriceRequestBids = ({ accountId, userId, priceRequest }) => ({
  accountId,
  userId,
  priceRequest,
  async init({ priceRequestId }) {
    this.priceRequest =
      priceRequest ||
      (await PriceRequest.first(
        { _id: priceRequestId },
        {
          fields: {
            creatorId: 1,
            customerId: 1,
            bidders: 1,
            items: 1,
            settings: 1
          }
        }
      ));
    SecurityChecks.checkIfExists(this.priceRequest);

    return this;
  },
  async get() {
    const { isOwner, isCustomer } = getRoleInRequest(
      this.priceRequest,
      this.accountId
    );

    let { bidders = [] } = this.priceRequest || {};
    if (!isOwner && !isCustomer) {
      const myBid =
        bidders.find(({ accountId: accId }) => accId === this.accountId) || {};

      // ensure each item has a simpleBid line with appropriate chargeLines:
      myBid.simpleBids = await loadSimpleBidLines({
        priceRequest: this.priceRequest,
        myBid
      });

      bidders = [{ ...myBid }];
    }
    return bidders;
  }
});
