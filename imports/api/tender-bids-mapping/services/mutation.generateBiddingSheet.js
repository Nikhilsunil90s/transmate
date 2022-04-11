import SecurityChecks from "/imports/utils/security/_security";

// collections
import { TenderBidDataMeta } from "../../tender-bids-data/TenderBidDataMeta";
import { TenderBidMapping } from "../TenderBidMapping";
import { TenderBid } from "../../tender-bids/TenderBid";

// fn
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

const debug = require("debug")("tenderBid:mutation:generateBiddingSheet");

export const generateBiddingSheet = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderBidId }) {
    if (!tenderBidId) throw new Error("TenderBidId not set");
    this.tenderBidId = tenderBidId;
    this.tenderBid = await TenderBid.first(
      { _id: tenderBidId },
      { fields: { _id: 1 } }
    );

    SecurityChecks.checkIfExists(this.tenderBid);

    // get all mappingIds
    this.mappingIds = await TenderBidMapping._collection
      .rawCollection()
      .distinct("_id", {
        tenderBidId
      });

    // TODO [$6130a08837762e00094fd3d9]: currently only 1 mappingId can be passed in the generate sheet
    // we want the sheet to be the result of multiple mappings
    // eslint-disable-next-line prefer-destructuring
    this.mappingId = this.mappingIds[0];
    if (!this.mappingId) throw new Error("No mappingId set!");
    return this;
  },
  async generate() {
    debug("generate");
    try {
      await TenderBidDataMeta._collection.update(
        { tenderBidId: this.tenderBidId },
        { $set: { modified: true } },
        { upsert: true }
      );
      debug("callCloudFunction");
      this.cloudResult = await callCloudFunction(
        "tenderifyUnifiedpricelist",
        {
          accountId: this.accountId,
          mappingId: this.mappingId,
          tenderBidId: this.tenderBidId
        },
        { userId: this.userId, accountId: this.accountId }
      );
      debug("cloudresult %o", this.cloudResult);
    } catch (error) {
      throw new Error(`issue with mapping:${error.message}`);
    }
    return this;
  },
  getUIResponse() {
    return true;
  }
});
