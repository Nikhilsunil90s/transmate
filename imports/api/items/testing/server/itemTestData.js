import faker from "faker";
import {
  itemQtyUnits,
  itemWeightUnits,
  itemDimensionUOM
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units.js";

import { Random } from "/imports/utils/functions/random.js";
import { _ } from "meteor/underscore";

const generateItemData = () => {
  return {
    shipmentId: Random.id(),
    description: faker.lorem.words(),
    quantity: faker.random.number(),
    quantity_unit: _.sample(itemQtyUnits),
    hazmat: faker.random.boolean(),
    DG: faker.random.boolean(),
    DGClassType: faker.random.word(),
    classType: 0,
    commodity: faker.random.word(),
    reference: {
      order: faker.random.word(),
      delivery: faker.random.words()
    },
    material: {
      id: faker.random.word(),
      description: faker.lorem.sentence()
    },

    // weight
    weight_net: faker.random.number(),
    weight_gross: faker.random.number(),
    weight_unit: _.sample(itemWeightUnits),

    // dimensions
    dimensions: {
      length: faker.random.number(),
      width: faker.random.number(),
      height: faker.random.number(),
      uom: _.sample(itemDimensionUOM)
    },
    volume: {
      kg: faker.random.number(),
      lm: faker.random.number(),
      m3: faker.random.number(),
      l: faker.random.number(),
      pal: faker.random.number()
    },

    // Packaging
    packaging: {
      quantity: faker.random.number(),
      type: faker.random.word(),
      returnable: faker.random.boolean()
    }
  };
};

export { generateItemData };
