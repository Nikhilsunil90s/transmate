import { Stage } from "/imports/api/stages/Stage";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";
import { Shipment } from "/imports/api/shipments/Shipment";
import { stringifyBlackbox } from "/imports/api/shipments/services/stringifyBlackbox";

const debug = require("debug")("apollo:dataloader");

export const allAccountsLoader = async ({ keys, userId, accountId }) => {
  debug("allAccountsLoader called with %o ", { keys, userId, accountId });

  try {
    const dbIds = await AllAccounts.find(
      { _id: { $in: keys } },
      {
        fields: {
          id: 1,
          name: 1,
          type: 1,
          key: 1,
          accounts: { $elemMatch: { accountId } }
        }
      }
    ).fetch();
    debug("AllAccounts %o", { dbIds });

    // to do include elemMatch:  {          "$elemMatch": {             "accountId":  "S70325"}         }

    // dataloader expects the same number of elements in same order!
    return keys.map(id => (dbIds || []).find(obj => obj._id === id) || {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const userLoader = async ({ keys }) => {
  debug("user called with %o", keys);
  try {
    const dbIds = await User.find({ _id: { $in: keys } }).fetch();
    debug("users found  %o", dbIds.length);

    // dataloader expects the same number of elements in same order!
    return keys.map(id => (dbIds || []).find(obj => obj._id === id) || {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const stageLoader = async ({ keys }) => {
  debug("stageLoader called with %o", keys);
  try {
    const dbIds = await Stage.find(
      { _id: { $in: keys } },
      { fields: { id: 1, plate: 1 } }
    ).fetch();

    debug("stageLoader found  %o", dbIds.length);

    // dataloader expects the same number of elements in same order!
    return keys.map(id => (dbIds || []).filter(obj => obj._id === id) || []);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const shipmentLoader = async ({ keys }) => {
  debug("shipmentLoader called with %o", keys);
  try {
    const dbIds = await Shipment.find(
      { _id: { $in: keys } },
      { fields: { seaLane: 0 } }
    ).fetch();

    debug("shipmentLoader found  %o", dbIds.length);
    const stringifiedShipments = dbIds.map(shipment =>
      stringifyBlackbox(shipment)
    );

    // dataloader expects the same number of elements in same order!
    return keys.map(
      id => (stringifiedShipments || []).find(obj => obj._id === id) || []
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
