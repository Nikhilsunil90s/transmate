import { ShipmentItem } from "/imports/api/items/ShipmentItem";

const debug = require("debug")("apollo:dataloader:shipmentItem");

export const nestedItemLoader = async ({ keys }) => {
  try {
    const dbIds = await ShipmentItem.find({ _id: { $in: keys } }).fetch();
    debug("itemLoader found  %o", dbIds.length);

    // dataloader expects the same number of elements in same order!
    return keys.map(id => (dbIds || []).find(obj => obj._id === id) || {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};
