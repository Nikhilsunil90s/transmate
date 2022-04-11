import { AllAccounts } from "../AllAccounts";

const debug = require("debug")("shipment:getShipmentNumber");

const MAX_NUMBER_CHECKS = 100;

export const generateAccountId = async (type = "carrier") => {
  let typeCode;
  let match;
  let i = 0;
  const min = 1;
  const max = 99999;

  switch (type) {
    case "shipper":
      typeCode = "S";
      break;
    case "carrier":
      typeCode = "C";
      break;
    case "provider":
      typeCode = "P";
      break;
    default:
      typeCode = "S";
  }

  // try to create a new id for account and see if it is unique
  let accountId;

  do {
    const number = Math.floor(Math.random() * (max - min + 1) + min);
    accountId = `${typeCode}${String(number).padStart(5, "0")}`;
    debug("check account id :", accountId);
    // eslint-disable-next-line no-await-in-loop
    match = await AllAccounts.first({ _id: accountId }, { fields: { _id: 1 } });
    debug("result check existing account:%o", match);
    i += 1;
  } while (match && i < MAX_NUMBER_CHECKS);
  if (match) {
    throw Error(
      `not able to find unique accountId number, last try was ${accountId}`
    );
  }

  return accountId;
};
