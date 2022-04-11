import { Random } from "/imports/utils/functions/random.js";

import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("pricelist.import", {
  allowedFileTypes: /\.xls||\.xlsx/,
  maxSize: 20 * 1024 * 1024
});

createUploadsDirective("pricelist.import", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key() {
    return `documents/price-list/imports/${Random.id(5)}`;
  }
});
