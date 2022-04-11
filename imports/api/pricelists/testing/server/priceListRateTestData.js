import { _ } from "meteor/underscore";
import faker from "faker";
import { Random } from "/imports/utils/functions/random.js";

// collection
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";

import {
  multipliers,
  rateTypes
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units";

// price list comes in with volumes & lanes -> iterate both & create an item for each

export const generateRateData = ({ priceListId }) => {
  return {
    priceListId,
    costId: Random.id(),
    type: _.sample(rateTypes),
    name: faker.lorem.words(),
    amount: {
      value: 100,
      unit: "EUR"
    },
    multiplier: _.sample(multipliers),
    min: 0,
    max: 1000,
    rules: [],
    calculation: {
      formula: faker.lorem.word()
    },
    comment: faker.lorem.paragraph(),
    meta: { source: "table" }
  };
};

export const generateRateDataForPriceList = ({ priceList }) => {
  const priceListId = priceList._id;
  priceList.lanes.forEach(lane => {
    priceList.volumes.forEach(volumeGrp => {
      volumeGrp.ranges.forEach(rng => {
        const rateData = generateRateData({ priceListId });
        rateData.rules.push({ laneId: lane.id });
        rateData.rules.push({ volumeGroupId: volumeGrp.id });
        rateData.rules.push({ volumeRangeId: rng.id });
        PriceListRate.create(rateData);
      });
    });
  });
};

export const generateRateDataForPriceListAsync = async ({ priceList }) => {
  const priceListId = priceList._id;
  const promiseArr = [];
  priceList.lanes.forEach(lane => {
    priceList.volumes.forEach(volumeGrp => {
      volumeGrp.ranges.forEach(rng => {
        const rateData = generateRateData({ priceListId });
        rateData.rules.push({ laneId: lane.id });
        rateData.rules.push({ volumeGroupId: volumeGrp.id });
        rateData.rules.push({ volumeRangeId: rng.id });
        promiseArr.push(PriceListRate.create_async(rateData));
      });
    });
  });
  return Promise.all(promiseArr);
};
