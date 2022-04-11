import faker from "faker";
import { _ } from "meteor/underscore";
import {
  serviceLevels,
  incoterms
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units";
import { Random } from "/imports/utils/functions/random.js";

const generateFromTo = () => {
  return {
    latLng: {
      lat: Number(faker.address.latitude()),
      lng: Number(faker.address.longitude())
    },
    countryCode: faker.address.countryCode(),
    isValidated: faker.random.boolean(),
    zipCode: faker.address.zipCode(),

    addressId: Random.id(),
    locode: {
      id: "ABCDE",
      code: "ABC",
      function: "3"
    },
    name: faker.lorem.words(),
    address: {
      street: faker.address.streetAddress(),
      number: "12",
      city: faker.address.city(),
      state: faker.address.state()
    }
  };
};

const generateShipmentData = ({
  accountId = "S12345",
  userId = "dummy",
  shipperId,
  carrierId
}) => {
  return {
    // Meta data
    pickup: {
      location: generateFromTo(),
      date: faker.date.past()
    },
    delivery: {
      location: generateFromTo(),
      date: faker.date.future()
    },
    number: faker.random.word(),
    type: _.sample(["ocean", "road", "rail", "air", "multi"]),
    serviceLevel: _.sample(serviceLevels),
    incoterm: _.sample(incoterms),
    status: _.sample([
      "draft",
      "partial",
      "planned",
      "scheduled",
      "started",
      "completed",
      "canceled"
    ]),

    // // Users who are in charge of planning for this specific shipment (this has an
    // // impact on certain notifications etc)
    // plannerIds: {
    //   type: Array,
    //   optional: true
    // },
    // 'plannerIds.$': {
    //   type: String,
    //   regEx: SimpleSchema.RegEx.Id
    // },
    // Partners
    accountId,
    shipperId,
    carrierIds: [carrierId],
    priceListId: Random.id(),

    // Links
    stageIds: [],
    itemIds: [],

    // Flags (complex conditions to filter on)
    flags: [],
    references: {
      number: faker.lorem.word(),
      booking: faker.lorem.word(),
      carrier: faker.lorem.word()
    },

    equipments: [],

    // Time stamps
    created: { userId, at: new Date() },
    updated: { userId, at: new Date() },
    updates: [
      {
        action: "created",
        accountId,
        userId: Random.id(),
        ts: new Date()
      }
    ]
  };
};

const costItem = ({ accountId, userId }) => ({
  id: Random.id(6),
  costId: Random.id(),
  description: faker.lorem.words(),
  amount: {
    value: faker.random.number(),
    currency: "EUR",
    rate: 1
  },
  added: { accountId, userId }
});

const generateCostItem = costItem;

export const getCostItemForResolver = accountId => ({
  type: "additional",
  costId: Random.id(),
  description: faker.lorem.words(),
  accountId,
  amount: {
    value: faker.random.number(),
    currency: "EUR",
    rate: 1
  }
});

const generateShipmentCostData = ({ accountId }) => {
  return [
    { ...costItem(), source: "input", type: "additional", accountId },
    { ...costItem(), source: "priceList", priceListId: Random.id(), accountId }
  ];
};

export {
  generateShipmentData,
  generateFromTo,
  generateShipmentCostData,
  generateCostItem,
  costItem
};
