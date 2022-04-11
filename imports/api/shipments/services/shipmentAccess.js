import { check } from "/imports/utils/check.js";
import { Shipment } from "../Shipment";

const debug = require("debug")("shipment:access:set");

export const controlShipmentAccess = ({
  shipmentIds,
  action,
  id,
  accountIds
}) => {
  check(shipmentIds, Array);
  check(action, String);
  check(id, String);
  check(accountIds, Array);
  debug(
    "set access to shipment %o, for access %o, type %on id:%s",
    shipmentIds,
    accountIds,
    action,
    id
  );

  // remove old access for this id + type, for all accounts
  Shipment._collection.update(
    { "access.id": id, "access.action": action },
    { $pull: { access: { action, id } } },
    { multi: true }
  );
  if (accountIds.length > 0) {
    // set new access
    const access = accountIds.map(accountId => {
      return { accountId, action, id };
    });

    Shipment._collection.update(
      { _id: { $in: shipmentIds } },
      { $addToSet: { access: { $each: access } } },
      { multi: true }
    );
  }

  return true;
};
