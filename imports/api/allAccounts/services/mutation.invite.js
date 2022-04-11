import { JobManager } from "../../../utils/server/job-manager.js";
import { PartnerShipService } from "../../partnerships/services/service";
import { userContactService } from "./accountsUserService";
import { AllAccounts } from "../AllAccounts";

export const invitePartner = ({ userId, accountId }) => ({
  userId,
  accountId,
  context: { accountId, userId },
  async setUpPartner({
    type,
    company,
    role,
    email,
    firstName,
    lastName,
    sendInvite
  }) {
    this.partner = await AllAccounts.create_async({
      type,
      name: company,
      ...(role ? { role } : {}),
      accounts: [],
      created: { by: this.userId, at: new Date() }
    });
    this.partnerId = this.partner.id;

    // partnership: (added to both accounts)
    const srv = new PartnerShipService({
      requestorId: this.accountId,
      requestedId: this.partnerId
    });

    await srv.init();
    await srv.create();

    const userSrv = userContactService(this.context);
    await userSrv.init({ partner: this.partner, accountId: this.accountId });
    await userSrv.createUser({
      contact: {
        firstName,
        lastName,
        mail: email
      },
      options: { sendInvite }
    });
    await userSrv.addToContacts();

    const { userId: newUserId, url } = userSrv.get();

    this.userId = newUserId;
    this.url = url;
    return this;
  },
  setupNotifications() {
    JobManager.post("partner.created", {
      userId: this.userId,
      partnerId: this.partner._id
    });
    return this;
  },
  get() {
    return this.partner;
  }
});
