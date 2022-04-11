import { PartnerSearch } from "/imports/api/partnerships/services/partnerSearch";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

const debug = require("debug")("allaccounts:services");

export const getPartners = ({ accountId, userId }) => ({
  accountId,
  userId,
  get({ types, includeOwnAccount, excludeAccounts, includeInactive }) {
    debug("getPartners get %o", {
      types,
      includeOwnAccount,
      excludeAccounts,
      includeInactive
    });
    const pipeline = new PartnerSearch()
      .setAccount(this.accountId)
      .find({
        filter: { types, includeOwnAccount, excludeAccounts, includeInactive }
      })
      .project()
      .sort()
      .get();

    return AllAccounts._collection.aggregate(pipeline);
  }
});
