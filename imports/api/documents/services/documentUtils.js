import { JobManager } from "../../../utils/server/job-manager.js";
import { Document } from "/imports/api/documents/Document.js";

export const addDocument = ({ accountId, userId }) => ({
  accountId,
  userId,
  async add({ link, data }) {
    if (link && typeof link === "string") {
      // eslint-disable-next-line no-param-reassign
      link = {
        shipmentId: link
      };
    }
    const document = await Document.create_async({ ...link, ...data });
    JobManager.post("document.added", document, { userId: this.userId });
    return document.id;
  }
});
