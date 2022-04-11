import faker from "faker";
import moment from "moment";
import { Random } from "/imports/utils/functions/random.js";
import { generateByAt } from "/imports/utils/testing/dataGeneration/generateByAt";

const generateDataRoad = ({ accountId, carrierId }) => {
  return {
    creatorId: accountId,
    customerId: accountId,
    carrierId,
    carrierName: faker.company.companyName(),
    category: "standard",
    type: "contract",
    title: faker.lorem.words(),
    currency: "EUR", // some strange ones in faker...
    validFrom: faker.date.past(),
    validTo: moment()
      .add(1, "year")
      .toDate(),
    status: "active",
    terms: {
      days: 30,
      condition: "days"
    },
    mode: "road",
    template: {
      type: "road"
    },
    uoms: {
      allowed: ["kg"]
    },
    lanes: [
      {
        id: Random.id(6),
        name: faker.lorem.word(),
        from: {
          zones: [
            {
              CC: faker.address.countryCode(),
              from: "10",
              to: "40"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: faker.address.countryCode(),
              from: "80",
              to: "90"
            }
          ]
        }
      }
    ],
    volumes: [
      {
        id: Random.id(6),
        uom: "kg",
        serviceLevel: "LTL",
        name: faker.lorem.word(),
        ranges: [
          {
            id: Random.id(6),
            from: 0,
            to: 100
          }
        ]
      }
    ],
    defaultLeadTime: {
      days: [true, true, true, true, true, false, false],
      leadTimeHours: 24,
      frequency: "weekly"
    },
    created: generateByAt()
  };
};

const generateDataForm = ({ carrierId }) => {
  return {
    carrierId,
    category: "standard",
    currency: "EUR",
    mode: "road",
    terms: {
      days: 30
    },
    uoms: {
      allowed: ["kg"]
    },
    template: { type: "road" },
    title: faker.lorem.words(),
    type: "contract",
    validFrom: faker.date.past(),
    validTo: faker.date.future()
  };
};
export { generateDataRoad, generateDataForm };
