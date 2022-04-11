import { Random } from "/imports/utils/functions/random.js";

const MAX_NUMBER_CHECKS = 100;
export const generateUniqueId = (length, testList = []) => {
  let generatedId;
  let match;
  let i = 0;
  do {
    generatedId = Random.id(length);

    // eslint-disable-next-line no-await-in-loop
    match = testList.includes(generatedId);
    i += 1;
  } while (match && i < MAX_NUMBER_CHECKS);
  if (match) {
    throw Error(
      `not able to find unique shipment number, last try was ${generatedId}`
    );
  }
  return generatedId;
};
