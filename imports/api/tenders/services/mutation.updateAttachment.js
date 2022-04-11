import SecurityChecks from "/imports/utils/security/_security";

import { Document } from "/imports/api/documents/Document";
import { Tender } from "/imports/api/tenders/Tender";
import {
  fields,
  CheckTenderSecurity
} from "/imports/utils/security/checkUserPermissionsForTender";
import { pipelineBuilder } from "./_pipelineBuilder";

const debug = require("debug")("tender:resolvers");

export const updateAttachment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tenderId = tenderId;
    this.tender = await Tender.first(
      { _id: tenderId },
      { fields: { documentIds: 1, ...fields } }
    );

    return this;
  },
  async runChecks() {
    SecurityChecks.checkIfExists(this.tender);
    const check = new CheckTenderSecurity(
      {
        tender: this.tender
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );
    await check.getUserRoles();
    check
      .init()
      .can({ action: "editGeneral" })
      .throw();
    return this;
  },
  async remove({ documentId }) {
    debug("removing %s", documentId);
    await Document._collection.remove({ _id: documentId });
    await this.tender.pull({ documentIds: documentId });
    return this;
  },
  async add({ attachment }) {
    if (!attachment) throw new Error("No attachment to add");
    const { meta, store } = attachment;

    const document = await Document.create_async({
      tenderId: this.tenderId,
      store,
      meta
    });

    await this.tender.push({ documentIds: document.id });
    return this;
  },
  async getUIResponse() {
    const res = await pipelineBuilder({ accountId: this.accountId })
      .match({
        tenderId: this.tenderId,
        fields: { documentIds: 1 }
      })
      .getDocuments()
      .aggregate();

    return res[0];
  }
});
