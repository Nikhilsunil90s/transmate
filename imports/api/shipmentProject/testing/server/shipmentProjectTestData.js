import faker from "faker";
import { Random } from "/imports/utils/functions/random.js";
import { _ } from "meteor/underscore";
import { generateByAt } from "/imports/utils/testing/dataGeneration/generateByAt";
import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import {
  serviceLevels,
  incoterms
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units";

export const generateShipmentProjectData = ({ accountId, userId }) => {
  return {
    type: {
      code: faker.random.word(),
      group: faker.random.word(),
      name: faker.random.word()
    },
    accountId,
    title: faker.company.companyName(),
    year: faker.random.number(),
    inShipmentIds: [Random.id()],
    outShipmentIds: [Random.id()],
    status: faker.random.word(),
    group: faker.random.word(),
    event: faker.random.word(),
    created: generateByAt(userId),
    updated: generateByAt(userId),
    deleted: false
  };
};

export const generateFromTo = () => {
  return {
    latLng: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude()
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
      number: faker.random.number(),
      city: faker.address.city(),
      state: faker.address.state()
    }
  };
};

export const createShipment = () => {
  const shipment = {
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
    accountId: "S12345",
    shipperId: "S12345",
    carrierIds: ["C12345"],
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
    created: generateByAt(),
    updated: generateByAt(),
    updates: [
      {
        action: "created",
        accountId: "S12345",
        userId: Random.id(),
        ts: new Date()
      }
    ]
  };
  return Shipment._collection.insert(shipment);
};

export const createShipmentProjects = () => {
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= 10; i++) {
    const inShipmentId = createShipment();
    const outShipmentId = createShipment();
    const shipmentProject = {
      type: faker.random.word(),
      title: faker.company.companyName(),
      year: faker.random.number(),
      plannerIds: [Random.id()],
      inShipmentIds: [inShipmentId],
      outShipmentIds: [outShipmentId],
      status: faker.random.word(),
      group: faker.random.word(),
      event: faker.random.word(),
      created: generateByAt(),
      updated: generateByAt(),
      deleted: false
    };
    ShipmentProject._collection.insert(shipmentProject);
  }
};
