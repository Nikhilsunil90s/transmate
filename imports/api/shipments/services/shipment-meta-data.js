import { Shipment } from "/imports/api/shipments/Shipment.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts.js";
import { Meteor } from "meteor/meteor";
import { check } from "/imports/utils/check.js";
import { calculateTotalCost } from "/imports/utils/functions/recalculateCosts.js";

const debug = require("debug")("shipment:meta-data");

export async function getBidMetaData(shipmentId) {
  check(shipmentId, String);
  debug("start meta data for %o", shipmentId);
  const shipment = await Shipment.first(shipmentId, {
    fields: { costs: 1, accountId: 1, carrierIds: 1 }
  });
  debug("shipment data:%o", shipment);

  if (!shipment.carrierIds || !shipment.carrierIds[0])
    throw new Meteor.Error(`${shipmentId} has no carrier selected (anymore)!`);

  // get carrier EDI id
  // use first carrier (assumption  only 1 carrier in this)
  // calculate total on main cost currency
  debug("get account data %j", {
    "account.edi.account": shipment.accountId,
    _id: shipment.carrierIds[0]
  });

  const { profile, ediId, name } = await AllAccounts.getProfileData({
    accountId: shipment.carrierIds[0],
    myAccountId: shipment.accountId
  });
  debug("carrier account data:%o", profile);
  debug("carrier ediId data:%o", ediId);
  if (!profile)
    throw new Meteor.Error(
      `in ${shipment.carrierIds[0]} check profile data for ${shipment.accountId}!`
    );

  // take first from array , assumption only 1 edi id per account!

  const calculateTotalCostResult = await calculateTotalCost(shipment.costs);

  const { amount, currency, compareAmount } = calculateTotalCostResult;
  debug("compareAmount %o", compareAmount);
  debug("send amount %o", amount);

  // check data before sending
  check(amount, Number);
  check(shipmentId, String);

  check(currency, String);
  return {
    shipmentId,
    amount,
    currency,
    compareAmount,
    carrierId: shipment.carrierIds[0],
    carrierName: name,
    ediId
  };
}
