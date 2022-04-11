import SecurityChecks from "/imports/utils/security/_security.js";
import { CheckFeatureSecurity } from "/imports/utils/security/checkUserPermissionsForFeatures";
import { Document } from "../Document";
import { addShipmentDocument } from "../services/mutation.addShipmentDoc";
import { removeShipmentDocument } from "../services/mutation.removeShipmentDoc";
import { generateShipmentDoc } from "../services/mutation.generateShipmentDoc";
import { addDocument } from "../services/documentUtils";

export const resolvers = {
  DocumentType: {
    url: (document = {}) => {
      if (document.url) return document.url;
      const documentM = new Document(document);
      return documentM.url();
    },
    icon: (document = {}) => {
      if (document.icon) return document.icon;
      const documentM = new Document(document);
      return documentM.icon();
    }
  },
  Query: {
    async getDocument(root, args) {
      const { id } = args;
      await Document.first({ _id: id });
    }
  },
  Mutation: {
    async addShipmentDocument(root, args, context) {
      const { userId, accountId } = context;
      const { link, data } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      const srv = await addShipmentDocument({
        accountId,
        userId
      }).addDocument({ link, data });
      const res = await srv.getClientResponse();
      return res;
    },
    async addDocument(root, args, context) {
      const { userId } = context;
      const { link, data } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      return addDocument(context).add({ link, data });
    },
    async removeShipmentDocument(root, args, context) {
      const { userId, accountId } = context;
      const { documentId, shipmentId } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      const srv = await removeShipmentDocument({
        accountId,
        userId
      }).removeDocument({ documentId, shipmentId });
      const res = await srv.getClientResponse();
      return res;
    },
    async generateShipmentDocument(root, args, context) {
      const { userId, accountId } = context;
      const { type, shipmentId } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      const featureCheck = new CheckFeatureSecurity({}, context);
      await featureCheck.getDoc();
      featureCheck.can({ feature: "shipment" }).throw();
      const srv = await generateShipmentDoc({
        accountId,
        userId
      }).generateDocument({ type, shipmentId });
      const res = await srv.getClientResponse();
      return res;
    }
  }
};
