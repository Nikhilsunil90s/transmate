import { JobManager } from "../../../utils/server/job-manager.js";
import { PartnerShipService } from "../../partnerships/services/service";
import { getPartner } from "./query.getPartner";

export const updatePartnership = ({ userId, accountId }) => ({
  userId,
  accountId,
  context: { accountId, userId },
  async update({ partnerId, action }) {
    this.partnerId = partnerId;
    let status;
    switch (action) {
      case "accept":
        status = "active";
        JobManager.post("partnership.accepted", {
          requestedBy: this.partnerId,
          acceptedBy: this.accountId
        });
        break;
      case "reject":
        status = "rejected";
        JobManager.post("partnership.rejected", {
          requestedBy: this.partnerId,
          rejectedBy: this.accountId
        });
        break;
      case "deactivate":
        status = "inactive";
        break;
      default:
        status = "requested";
    }

    const srv = new PartnerShipService({
      requestorId: this.accountId,
      requestedId: this.partnerId
    });
    await srv.init();
    await srv.setStatus({ status });

    JobManager.post("partnership.accepted", partnerId);
    return this;
  },
  getUIResponse() {
    return getPartner(this.context).get({ partnerId: this.partnerId });
  }
});
