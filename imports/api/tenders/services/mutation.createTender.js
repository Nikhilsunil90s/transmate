import { JobManager } from "../../../utils/server/job-manager.js";
import { Tender } from "/imports/api/tenders/Tender";
import { stepManager } from "./_stepManager";

export const createTender = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create({ data }) {
    // TODO check if they can do this:
    // creating a new document
    this.tender = await Tender.create_async({
      ...data,

      // defaults:
      accountId,
      status: "draft",
      created: {
        by: userId,
        at: new Date()
      },
      contacts: [
        {
          userId,
          role: "owner"
        }
      ]
    });

    await stepManager(this.tender);

    JobManager.post("tender.created", {
      userId: this.userId,
      accountId: this.accountId,
      tenderId: this.tender.id
    });
    return this;
  },
  getUIResponse() {
    return this.tender;
  }
});
