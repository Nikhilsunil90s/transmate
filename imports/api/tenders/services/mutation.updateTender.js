import SecurityChecks from "/imports/utils/security/_security";
import { Tender } from "/imports/api/tenders/Tender";
import { tenderService } from "/imports/api/tenders/services/tender";
import { stepManager } from "./_stepManager";

export const updateTender = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tender = await Tender.first(tenderId);
    SecurityChecks.checkIfExists(this.tender);
    return this;
  },
  async update({ update, reset }) {
    // actions:
    this.tender = await this.tender.update(update);
    if (reset) {
      tenderService({ accountId: this.accountId, userId: this.userId })
        .init({ tender: this.tender, userId: this.userId })
        .reset();
    }
    await stepManager(this.tender);
    return this;
  },
  getUIResponse() {
    return this.tender.reload();
  }
});
