import { Random } from "/imports/utils/functions/random.js";

import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("tender.document", {
  allowedFileTypes: null,
  maxSize: 10 * 1024 * 1024
});

createUploadsDirective("tender.document", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `documents/tender/${meta.tenderId}/${Random.id(5)}`;
  }
});
