import { Random } from "/imports/utils/functions/random.js";
import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("shipment.document", {
  allowedFileTypes: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/vnd.ms-outlook",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "application/zip"
  ],
  maxSize: 10 * 1024 * 1024
});

createUploadsDirective("shipment.document", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return false;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `documents/shipment/${meta.shipmentId}/${Random.id(5)}`;
  }
});
