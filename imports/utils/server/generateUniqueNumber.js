import { Random } from "/imports/utils/functions/random.js";

const debug = require("debug")("shipment:getShipmentNumber");

const MAX_NUMBER_CHECKS = 100;
export const generateUniqueNumber = async (model, length = 8) => {
  let number;
  let match;
  let i = 0;
  do {
    number = Random.id(length).toUpperCase();

    // eslint-disable-next-line no-await-in-loop
    match = await model.first(
      { number: `${number}` },
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
