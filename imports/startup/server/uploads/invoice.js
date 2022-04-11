import { Random } from "/imports/utils/functions/random.js";

import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("invoice.document", {
  allowedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
  maxSize: 10 * 1024 * 1024
});

createUploadsDirective("invoice.document", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `documents/invoice/${meta.invoiceId}/${Random.id(5)}`;
  }
});
