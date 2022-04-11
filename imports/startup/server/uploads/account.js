import { Random } from "/imports/utils/functions/random.js";

import {
  createUploadsDirective,
  setUploadsFileRestrictions
} from "/imports/api/uploads/services/uploadsDirective";

setUploadsFileRestrictions("account.logo", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 1 * 1024 * 1024
});

setUploadsFileRestrictions("account.banner", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 3 * 1024 * 1024
});

setUploadsFileRestrictions("account.avatar", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 1 * 1024 * 1024 // 1 Mb
});

createUploadsDirective("account.logo", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `logos/${meta.accountId}/${Random.id(3)}`;
  }
});

createUploadsDirective("account.banner", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `banners/${meta.accountId}/${Random.id(3)}`;
  }
});

setUploadsFileRestrictions("account.documents", {
  allowedFileTypes: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/mspowerpoint",
    "application/x-mspowerpoint"
  ],
  maxSize: 1 * 1024 * 1024
});

createUploadsDirective("account.documents", "S3Storage", {
  acl: "public-read",
  authorize() {
    return true;
  },
  key(file, meta) {
    return `account/docs/${meta.accountId}/${Random.id(5)}`;
  }
});

createUploadsDirective("account.avatar", "S3Storage", {
  acl: "public-read",
  authorize({ meta }, { accountId }) {
    if (meta.accountId !== accountId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return true;
  },
  key(file, meta) {
    return `avatars/${meta.accountId}/${meta.userId}/${Random.id(3)}`;
  }
});
