import { Tender } from "/imports/api/tenders/Tender";
import SecurityChecks from "/imports/utils/security/_security";
import { tenderBidService } from "/imports/api/tenders/services/tenderBid";

export const updateBid = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tenderId = tenderId;
    this.tender = await Tender.first({ _id: tenderId });
    SecurityChecks.checkIfExists(this.tender);
    return this;
  },
  async updateBid({ topic, update }) {
    let updateMod = update;
    if (updateMod.responses != null) {
      updateMod = updateMod.responses; // on requirements we get an array...
    }
    if (updateMod.array != null) {
      // when we get an array (the method validation takes an object -> so this is a workaround)
      updateMod = updateMod.array;
    }
    const srv = tenderBidService({ userId, accountId })
      .init({ tender: this.tender })
      .check();
    await srv.updateBid({
      topic,
      update: updateMod
    });
    this.bidderIdx = srv.get("bidderIndex");
    return this;
  },
  async getUIResponse() {
    await this.tender.reload();
    return this.tender.bidders[this.bidderIdx];
  }
});
