import SecurityChecks from "/imports/utils/security/_security";

// collections
import { TenderBidMapping } from "../TenderBidMapping";
import { TenderBid } from "../../tender-bids/TenderBid";

// fn
import { getTenderBidMappings } from "./query.getMappings";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

const debug = require("debug")("tenderBid:service");

export const generateTenderBidMapping = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ mappingId }) {
    this.mappingId = mappingId;
    this.tenderBidMap = await TenderBidMapping.first(
      { _id: mappingId },
      { fields: { tenderBidId: 1 } }
    );
    SecurityChecks.checkIfExists(this.tenderBidMap);

    this.tenderBid = await TenderBid.first(
      { _id: this.tenderBidMap.tenderBidId },
      { fields: { _id: 1 } }
    );
    this.tenderBidId = this.tenderBid.id;
    SecurityChecks.checkIfExists(this.tenderBid);
    return this;
  },
  async generate() {
    // update "status.processing" flag to start spinner (function sets this to false)
    await this.tenderBidMap.update_async({ "status.processing": true });
    debug("call function generate for %", this.tenderBid.id);
    await callCloudFunction(
      "tenderifyMap",
      {
        accountId: this.accountId,
        mappingId: this.mappingId,
        tenderBidId: this.tenderBid.id
      },
      { userId: this.userId, accountId: this.accountId }
    );
    return this;
  },
  async getUIResponse() {
    const srv = await getTenderBidMappings(this.context).init({
      tenderBidId: this.tenderBid.id
    });
    return srv.get();
  }
});
