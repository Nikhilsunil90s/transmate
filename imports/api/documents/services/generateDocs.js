import { Random } from "/imports/utils/functions/random.js";
import { check } from "/imports/utils/check.js";
import SecurityChecks from "/imports/utils/security/_security";
import { DocTemplate } from "/imports/api/templates/Template";
import get from "lodash.get";
import { s3url } from "/imports/utils/functions/s3url.js";
import { Shipment } from "../../shipments/Shipment";
import { addDocument } from "/imports/api/documents/services/documentUtils";
import { Document } from "/imports/api/documents/Document.js";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

const debug = require("debug")("documents:generateDocs");

export const storeLinkToDocument = async (
  { document, link },
  { accountId, userId }
) => {
  const { size, Key, Bucket } = document || {};
  debug("storeLinkToDocument", { size, Key, Bucket });
  let documentId;
  if (Key && Bucket && link && link.type) {
    // delete old (delivery) notes
    // { "link": {documentType: "deliveryNote",id:"5G3H5iL47mab24Z2a"  }, "shipmentId": "5G3H5iL47mab24Z2a" }
    // remove old documents:
    if (
      (link.shipmentId && link.type === "deliveryNote") ||
      link.type === "stageConfirmation"
    ) {
      await Document._collection.remove({ ...link });
    }

    // add new delivery note
    debug("add to documents");
    documentId = await addDocument({ userId, accountId }).add({
      link,
      data: {
        meta: {
          type: "application/pdf",
          name: `${link.type} ${Random.id(5)}.pdf`,
          lastModifiedDate: new Date(),
          size: size || 1 // to do : put real value
        },
        store: {
          service: "s3",
          bucket: Bucket,
          key: Key
        }
      }
    });
  }
  const url = s3url({ bucket: Bucket, key: Key });
  return { url, documentId };
};

/**
 * generate document in pdf format.
 * @param {string} shipmentId - shipmentId.
 * @param {string} templateName - templateName.
 * @param {object} data - data used in the template.
 * @param {{stageId:string,shipmentId:string,template:string }} link - object representing the link with de document, should be unique.

 * @return {{documentId: string}} - returns the documentId

 */
export const generateShipmentDocument = async (
  { shipmentId, templateName, data, link },
  { accountId, userId }
) => {
  const shipment = await Shipment.first(shipmentId, {
    fields: { _id: 1, accountId: 1 }
  });
  SecurityChecks.checkIfExists(shipment);
  check(shipment.accountId, String);

  // takes template default or account specific
  // account specific first due to sort
  const docTemplate = await DocTemplate.get({
    name: templateName,
    accountId: shipment.accountId
  });
  if (!docTemplate) {
    console.error(
      `No template doc found for ${templateName} (${shipment.accountId})`
    );
    throw new Error("Not found");
  }

  // convert template to Buffer (base64) to avoid issues with template data in json
  const template = Buffer.from(docTemplate.template).toString("base64");
  const Key = `documents/shipment/${shipmentId}/${Random.id(5)}`;
  const Bucket = process.env.AWS_S3_BUCKET;
  const { footerLine, termsAndConditions } = docTemplate;

  // debug("create doc with data %o", data);

  const response = await callCloudFunction(
    "generateDoc",
    {
      template,
      templateData: { ...data, footerLine, termsAndConditions },
      options: {
        Bucket,
        Key
      }
    },
    { accountId, userId }
  );

  debug("document response : %o", response);
  const html = get(response, "result.html");
  const size = get(response, "result.size");

  debug("document url : %o", get(response, "result.url"));

  if (!get(response, "result.url"))
    throw new Error("Generate doc: No url in function response");

  // add shipmentId in link if you want to show it on the shipment page
  const { documentId, url } = await storeLinkToDocument(
    {
      document: { size, Key, Bucket },
      link: { ...link, type: templateName }
    },
    { accountId, userId }
  );

  return { html, url, documentId };
};
