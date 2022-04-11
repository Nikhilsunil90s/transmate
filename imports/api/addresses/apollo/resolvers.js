import { getAddress } from "../services/query.getAddressWithAnnotation";
import { getAddresses } from "../services/query.getAddresses";
import { saveAddressContacts } from "../services/mutation.saveAddressContacts";
import { removeAddress } from "../services/mutation.removeAddress";
import { linkAddress } from "../services/mutation.linkAddress";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { annotateAddress } from "../services/mutation.annotateAddress";
import SecurityChecks from "/imports/utils/security/_security";
import { searchAddress } from "../services/query.searchAddress";
import { addressOverview } from "../services/query.addressOverview";
import { Address } from "../Address";

const debug = require("debug")("address:resolvers");

export const resolvers = {
  Address: {
    name: address => {
      return address?.annotation?.name || address.aliases?.[0];
    },
    addressFormatted: address => {
      return address?.addressFormatted || Address.init(address).format();
    },
    linkedAccountsCount: address =>
      address?.linkedAccountsCount || address?.linkedAccounts?.length
  },
  Query: {
    async getAddress(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId, accountId: annotationAccountId } = args;
      try {
        const address = await getAddress({ accountId, userId }).get({
          addressId,
          annotationAccountId
        });
        debug("address %o", address);
        return address;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getAddresses(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressIds } = args;
      try {
        const address = await getAddresses({ accountId, userId }).get({
          addressIds
        });
        debug("address %o", address);
        return address;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getAddressOverview(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewKey, nameFilter } = args.input;

      return addressOverview({ accountId, userId })
        .buildQuery({
          viewKey,
          nameFilter
        })
        .get();
    },
    async getLocationInfo(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { id, type } = args;
      try {
        const res = {};
        if (type === "address") {
          res.address = await getAddress({ accountId, userId }).get({
            addressId: id,
            annotationAccountId: accountId
          });
        }
        if (type === "locode") {
          res.locode = Location.first();
        }
        debug("address %o", res);
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async validateAddress(root, args, context) {
      const { userId } = context;
      const { input } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const response = await callCloudFunction(
          "CheckAddress",
          {
            address: { input }
          },
          context
        );
        debug("call api address :", response);

        if (response && response.result) {
          return { ...response.result, id: response.result._id };
        }
        debug("ERROR address validation :%o", response);
        return { warning: "Not able to geocode the address" };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async searchAddress(root, args, context) {
      const { userId, accountId } = context;

      SecurityChecks.checkLoggedIn(userId);

      const { query, options } = args.input;

      const searchObject = await searchAddress({ accountId, userId }).search({
        query,
        options
      });
      return searchObject.getResults();
    }
  },

  Mutation: {
    async saveAddressContacts(root, { input }, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId, partnerId, contacts = [] } = input;

      try {
        const res = await saveAddressContacts({ accountId, userId })
          .init({ addressId, partnerId })
          .saveContacts({ contacts });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async linkAddress(root, args, context) {
      const { accountId, userId } = context;
      const { addressId, name, updates } = args;

      SecurityChecks.checkLoggedIn(userId);

      const srv = linkAddress({ accountId, userId });
      await srv.init({ addressId });
      await srv.link({ name, updates });
      return srv.getUIResponse();
    },
    async removeAddress(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId } = args;

      debug("Remove address %s for account %s", addressId, accountId);
      const srv = removeAddress({ accountId, userId });
      await srv.init({ addressId });
      await srv.check();
      return srv.remove();
    },
    async annotateAddress(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId, updates } = args.input;
      const srv = annotateAddress({ accountId, userId });
      await srv.init({ addressId });
      await srv.update({ updates });
      return srv.getUIResponse();
    }
  }
};
