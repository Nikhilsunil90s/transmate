import { JobManager } from "../../../utils/server/job-manager.js";
import { PartnerShipService } from "../../partnerships/services/service";
import { getPartner } from "./query.getPartner";

export const createPartnership = ({ userId, accountId }) => ({
  userId,
  accountId,
  async create({ partnerId }) {
    const srv = new PartnerShipService({
      requestorId: this.accountId,
      requestedId: partnerId
    });
    await srv.init();
    await srv.create();
    const { requestedBy, requestedTo } = srv.get();

    this.partnerId = partnerId;
    this.requestedBy = requestedBy;
    this.requestedTo = requestedTo;
    return this;
  },
  setupNotifications() {
    JobManager.post("partnership.requested", {
      requestedBy: this.requestedBy,
      requestedTo: this.requestedTo
    });
    return this;
  },
  async get() {
    const partner = await getPartner({
      accountId: this.accountId,
      userId: this.userId
    }).get({ partnerId: this.partnerId });
    return partner;
  }
});
