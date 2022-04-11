import faker from "faker";
import { _ } from "meteor/underscore";
import { Random } from "/imports/utils/functions/random.js";

import { generateByAt } from "/imports/utils/testing/dataGeneration/generateByAt";
import { AccountService } from "/imports/api/allAccounts/services/service";
import {
  bidOptions,
  requirementType,
  responseType
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_tender";

export const generateDocument = () => ({
  id: Random.id(),
  name: faker.lorem.words()
});

export const generateTenderData = ({ accountId, userId }) => ({
  number: Random.id(),
  title: faker.lorem.words(),
  status: "draft",
  steps: ["general"],
  notes: {
    introduction: faker.lorem.paragraphs(),
    procedure: faker.lorem.paragraphs()
  },
  accountId,
  contacts: [{ userId, role: "owner" }], // contactTypes
  documentIds: [Random.id()],
  requirements: [
    {
      id: Random.id(6),
      type: _.sample(requirementType),
      title: faker.lorem.words(),
      details: faker.lorem.paragraph(),
      responseType: _.sample(responseType)

      // responseOptions: ["..."]
    }
  ],

  // captures bid settings
  params: {
    bid: {
      types: _.sample(bidOptions),
      priceListId: Random.id()
    },

    // query: {
    //   optional: true,
    //   type: ShipmentsFilterQueryShortSchema
    // },
    NDA: {
      required: false,
      type: _.sample(["default", "custom"]),
      documentId: Random.id()
    }
  },
  timeline: [
    {
      title: faker.lorem.sentence(),
      details: faker.lorem.paragraph(),
      date: faker.date.future()
    }
  ],

  // profile: [{}],
  // scope: {},

  // this is an aggregation of the scope ->
  packages: [
    {
      pickupCountry: "BE",
      bidGroups: [
        {
          id: Random.id(6),
          pickupCountry: "BE",
          pickupZip: "9000",

          // pickupLocode: "ANR",
          pickupName: faker.lorem.sentence(),
          deliveryCountry: "FR",
          deliveryZip: "19999",

          // deliveryLocode: "TES",
          deliveryName: faker.lorem.sentence(),
          equipment: faker.lorem.word(),

          // DG
          // DG class
          // conditions
          shipmentIds: [Random.id()],
          quantity: {
            scopeCount: faker.random.number(),
            shipCount: faker.random.number(),
            totalAmount: faker.random.number(),
            avgAmount: faker.random.number(),
            minAmount: faker.random.number(),
            maxAmount: faker.random.number(),
            stdevAmount: faker.random.number(),

            // currentCost: type: Number, optional: true
            currentAvgLeadtime: faker.random.number()
          }
        }
      ]
    }
  ],

  bidders: [
    {
      accountId: AccountService.generateId("carrier"),
      userIds: [Random.id()],
      contact: {
        name: faker.name.lastName(),
        mail: faker.internet.email()
      },
      bids: [Random.id(6)],
      requirements: [
        {
          id: Random.id(),
          responseBool: true
        }
      ],
      priceLists: [
        {
          id: Random.id(),
          title: faker.lorem.sentence()
        }
      ],
      documents: [generateDocument()],
      NDAresponse: {
        accepted: true,
        doc: generateDocument(),
        ts: generateByAt()
      },

      firstSeen: faker.date.past(),
      lastSeen: faker.date.past()
    }
  ],
  FAQ: [
    {
      title: faker.lorem.sentence(),
      details: faker.lorem.paragraph()
    }
  ],
  created: generateByAt(),
  updated: generateByAt(),
  released: generateByAt()
});
