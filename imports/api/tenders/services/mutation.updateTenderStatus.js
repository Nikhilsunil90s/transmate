import { JobManager } from "../../../utils/server/job-manager.js";
import { Tender } from "/imports/api/tenders/Tender";
import {
  CheckTenderSecurity,
  fields
} from "/imports/utils/security/checkUserPermissionsForTender";

export const updateTenderStatus = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tenderId = tenderId;
    this.tender = await Tender.first(tenderId, { fields });
    if (!this.tender) throw new Error("Tender not found");

    this.security = new CheckTenderSecurity(
      { tender: this.tender },
      { accountId: this.accountId, userId: this.userId }
    );
    await this.security.getUserRoles();
    this.security.init();
    return this;
  },
  async release() {
    this.security.can({ action: "canRelease" }).throw();

    await this.tender.update({ status: "open" });
    JobManager.post("tender.released", this.tender);
    return this;
  },
  async setToDraft() {
    this.security.can({ action: "canSetBackToDraft" }).throw();

    await this.tender.update({ status: "draft" });
    JobManager.post("tender.draft", this.tender);
    return this;
  },

  setToReview() {
    this.security.can({ action: "canSetToReview" }).throw();

    this.tender.update({ status: "review" });
    return this;
  },
  close() {
    this.security.can({ action: "canBeClosed" }).throw();

    this.tender.update({ status: "closed" });
    return this;
  },
  async cancel() {
    this.security.can({ action: "canBeCanceled" }).throw();

    await this.tender.update({ status: "canceled" });
    JobManager.post("price-tender.canceled", this.tender);
    return this.tender;
  },
  updateStatus({ action }) {
    switch (action) {
      case "release":
        return this.release();
      case "setToDraft":
        return this.setToDraft();
      case "setToReview":
        return this.setToReview();
      case "close":
        return this.close();
      case "cancel":
        return this.cancel();
      default:
        throw new Meteor.Error(
          "invalid action",
          "could not perform this action"
        );
    }
  },
  getUIResponse() {
    return this.tender;
  }
});
