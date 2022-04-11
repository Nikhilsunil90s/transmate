import { Address } from "/imports/api/addresses/Address";

const debug = require("debug")("apollo:dataloader:address");

export const addressAnnotationLoader = async ({ keys, accountId }) => {
  debug("addressLoader called with %o", keys);
  try {
    const dbIds = await Address.find(
      {
        _id: { $in: keys }
      },
      {
        fields: { accounts: { $elemMatch: { id: accountId } } }
      }
    ).fetch();
    debug("addressLoader found  %o", dbIds.length);

    // dataloader expects the same number of elements in same order!
    return keys.map(id => (dbIds || []).find(obj => obj._id === id) || {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};
