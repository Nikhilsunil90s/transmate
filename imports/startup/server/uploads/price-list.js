import { Random } from "/imports/utils/functions/random.js";

import SecurityChecks from "/imports/utils/security/_security.js";

import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("pricelist.attachment", {
  allowedFileTypes: /./,
  maxSize: 20 * 1024 * 1024
});

createUploadsDirective("pricelist.attachment", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId, userId }) {
    SecurityChecks.checkLoggedIn(userId);
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `documents/price-list/${meta.id}/${Random.id(5)}`;
  }
});
