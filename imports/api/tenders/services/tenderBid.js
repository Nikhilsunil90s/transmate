import moment from "moment";
import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security";
import { Meteor } from "meteor/meteor";

// data & collection
import { duplicatePriceList } from "/imports/api/pricelists/services/mutation.duplicatePriceList";

// only run in server!!
export const tenderBidService = ({ accountId, userId }) => ({
  accountId,
  userId,

  /** initilizes the tender doc & the bidder entry
   * @param {{tender: Object, bidderAccId: String*}}
   */
  init({ tender, bidderAccId }) {
    this.tender = tender;
    SecurityChecks.checkIfExists(this.tender);
    this.customerId = this.tender.accountId;
    this.creatorId = this.tender.accountId;

    this.bidderAccountId = bidderAccId || this.accountId;
    this.bidderIndex = (this.tender.bidders || []).findIndex(
      ({ accountId: itemAccId }) => itemAccId === this.bidderAccountId
    );
    if (this.bidderIndex === -1)
      throw new Error("Bidder entry not found in bidders array");
    this.myBid = (this.tender.bidders || [])[this.bidderIndex];
    return this;
  },
  check() {
    // TODO [#154]: do some checks:
    if (!this.myBid)
      throw new Meteor.Error("Error", "You can't place a bid for this tender");
    return this;
  },
  setTimeStamps() {
    if (this.myBid) {
      const { firstSeen } = this.myBid;
      const update = {
        [`bidders.${this.bidderIndex}.lastSeen`]: new Date(),
        ...(!firstSeen
          ? { [`bidders.${this.bidderIndex}.firstSeen`]: new Date() }
          : undefined)
      };
      // eslint-disable-next-line consistent-return
      return this.tender.update_async(update);
    }
    return null;
  },

  updateBid({ topic, update }) {
    // only if tender is open
    /*
    Bidders: [ {accountId
        opened: y/n
        bids: []#allIds that are checked...
        priceLists: [] #he can attach multiple
        documents: [] #documents attached
    }] */
    // best would have been the update as: (but it does not work??)
    // Tender._collection.rawCollection.update({"_id":"EDHYxTKRLspAL5mwX"},
    // {"$addToSet":{"bidders.$[elem].bids":"test3"}},
    // {"arrayFilters":[{"elem.accountId":{"$eq":"S65957"}}],bypassCollection2:true})

    const setOfferedFlag =
      ["priceLists", "documents"].includes(topic) && !this.myBid.bid;

    // eslint-disable-next-line consistent-return
    return this.tender.update_async({
      [`bidders.${this.bidderIndex}.${topic}`]: update,
      ...(setOfferedFlag
        ? { [`bidders.${this.bidderIndex}.bid`]: new Date() }
        : {})
    });
  },

  async bidFixedPriceList() {
    // 0. purpose: tender mgr choose a template, user fills out
    // 1. copy the reference, with carrierId in it...
    // 2. store the Id in the doc
    // 3. go to the document

    // check 1: Do I have made a bid already?
    if (!!get(this.myBid, ["priceLists", 0, "id"])) {
      this.copiedPriceListId = this.myBid.priceLists[0].id;
      return this;
    }

    // check 2: is the tender allowing a pricelist:
    const { priceListId } = this.tender.params.bid;
    if (!priceListId) throw Error("Tender is a no-fixed bid tender");

    const bidderId = this.bidderAccountId;
    const newTitle = `${this.tender.title} - ${bidderId}`;

    const overrides = {
      tenderTemplate: true,
      copyToOtherAccount: true,
      data: {
        carrierId: bidderId,
        customerId: this.tender.accountId,
        tenderId: this.tender._id,
        title: newTitle,
        status: "requested",
        validFrom: moment()
          .startOf("month")
          .toDate(),
        validTo: moment()
          .startOf("month")
          .add(1, "year")
          .toDate()
      }
    };

    const srv = duplicatePriceList({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.init({ priceListId });
    await srv.duplicate({ rates: false, overrides });
    this.copiedPriceListId = srv.getId();

    const update = [
      {
        id: this.copiedPriceListId,
        title: newTitle
      }
    ];
    await this.updateBid({
      topic: "priceLists",
      update
    });

    this.myBid.priceLists = update;

    // eslint-disable-next-line consistent-return
    return this;
  },
  get(topic) {
    return this[topic];
  }
});
