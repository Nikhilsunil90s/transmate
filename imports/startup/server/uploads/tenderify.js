import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("tenderify.document", {
  allowedFileTypes: null,
  maxSize: 10 * 1024 * 1024
});

createUploadsDirective("tenderify.document", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `documents/tenderify/${meta.tenderBidId}/${meta.id}`;
  }
});
