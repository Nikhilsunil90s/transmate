import SecurityChecks from "/imports/utils/security/_security";
import { TenderBidMapping } from "../TenderBidMapping";
import { TenderBid } from "../../tender-bids/TenderBid";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { getTenderBidMappings } from "./query.getMappings";

const debug = require("debug")("tenderBid:services:mutation");

export const addTenderBidMapping = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    const tenderBid = await TenderBid.first(
      { _id: tenderBidId },
      { fields: { _id: 1 } }
    );
    SecurityChecks.checkIfExists(tenderBid);
    return this;
  },
  async addMapping({ mapping }) {
    debug("addMapping %o", mapping);
    const tenderBidMapping = await TenderBidMapping.create_async({
      tenderBidId: this.tenderBidId,
      ...mapping,
      url: undefined,
      workbookFileUrl: mapping.url,
      status: { processing: true },
      created: {
        by: this.userId,
        at: new Date()
      }
    });

    try {
      // call file Read -> don't wait for it -> poll in the UI while the status is processing...
      callCloudFunction(
        "tenderifyReadFile",
        {
          accountId,
          mappingId: tenderBidMapping.id
        },
        { userId: this.userId, accountId: this.accountId }
      );
    } catch (error) {
      // if there was an error in the processing -> roll back the creation of the mapping document
      await tenderBidMapping.destroy_async();
      throw error;
    }

    return this;
  },
  getUIResponse() {
    return getTenderBidMappings(this.context)
      .init({ tenderBidId: this.tenderBidId })
      .get();
  }
});
