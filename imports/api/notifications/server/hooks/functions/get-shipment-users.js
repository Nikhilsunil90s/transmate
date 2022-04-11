import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";

// Returns all the users with one of the given roles linked to either the shipper
// or the carrier of the given shipment.
export const DB_FIELDS = { shipperId: 1, carrierIds: 1 };

// FIXME: test needed
export const getShipmentUsers = async (
  shipment,
  roles = ["core-shipment-update", "core-shipment-create"]
) => {
  const shipper = await Shipment.init(shipment).getShipper();
  const userIds = (await AllAccounts.getUsers_async(shipper.id, roles)).map(
    u => {
      return u._id;
    }
  );

  await Promise.all(
    (shipment.carrierIds || []).map(async carrierId => {
      const carrierUsers = await AllAccounts.getUsers_async(carrierId, roles);
      return carrierUsers.forEach(u => {
        return userIds.push(u._id);
      });
    })
  );
  return [...new Set(userIds)];
};
