/* eslint-disable no-undef */
import { Address } from "/imports/api/addresses/Address.js";

debug = require("debug")("migrations");

Migrations.add({
  version: 14,
  name: "modify Address accounts structure",
  up: () => {
    // this migrates the accounts structure
    // old structure: account.[accountId].fields
    // new structure -> accounts[{id: acountId, ..fields}]
    const AddrColl = Address._collection;
    AddrColl.find({ account: { $exists: true } }).forEach(doc => {
      const accountOld = doc.account;
      const accounts = [];
      const linkedAccounts = [];
      Object.keys(accountOld).forEach(accountId => {
        const { safety } = accountOld[accountId];
        if (safety && typeof safety !== "object") {
          accountOld[accountId].safety = { instructions: safety }; // !must be object
        }
        accounts.push({
          id: accountId,
          ...accountOld[accountId]
        });
        linkedAccounts.push(accountId); // denormalization
      });
      AddrColl.update({ _id: doc._id }, { $set: { accounts, linkedAccounts } });
      AddrColl.update({ _id: doc._id }, { $unset: { account: "" } });
    });
  }
});
