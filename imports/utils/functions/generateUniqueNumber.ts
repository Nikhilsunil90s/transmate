import { Random } from "/imports/utils/functions/random.js";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("shipment:getShipmentNumber");

const MAX_NUMBER_CHECKS = 100;

/**
 * will generate a unique number / key with n digits and verifies in the database for uniqueness
 */
export const generateUniqueNumber = async (
  length = 8,
  collection = Shipment
) => {
  let number: string;
  let match: boolean;
  let i: number = 0;
  do {
    number = Random.id(length).toUpperCase();

    // eslint-disable-next-line no-await-in-loop
    match = await collection.first(
      { number: `${number}` },

      // @ts-ignore FIXME TS
      { fields: { number: 1 } }
    );
    debug("check if %s, exists ? : %o, in loop %o", number, !!match, i);
    i += 1;
  } while (match && i < MAX_NUMBER_CHECKS);
  if (match) {
    throw Error(
      `not able to find unique shipment number, last try was ${number}`
    );
  }
  return number;
};
