import get from "lodash.get";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts.js";

export const getShipmentPlanners = async shipment => {
  if (get(shipment, ["plannerIds", "length"])) {
    return shipment.plannerIds;
  }

  // planners should come from shipment.accountId

  const users = await AllAccounts.getUsers_async(shipment.accountId, [
    "core-shipment-update",
    "core-shipment-create"
  ]);

  return [...new Set([users.map(({ id }) => id)])];
};
