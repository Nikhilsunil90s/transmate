import { Random } from "/imports/utils/functions/random.js";
import faker from "faker";

import { DHL_CARRIER_ID } from "../DHL-utils";

export const confirmOptionMock = ({ packingItemIds = [] }) => {
  const id = Random.id();
  return {
    id,
    object_id: id, // required for cancelling
    labelUrl: faker.internet.url(),
    trackingNumbers: packingItemIds.reduce((acc, cur) => {
      acc[cur] = Random.id();
      return acc;
    }, {}),
    status: "created",

    // costs should be mapped towards Transmate format as they will be set in the shipment
    costs: [
      {
        costId: "o6fLThAWhaWW3uDaj",
        isManualBaseCost: true,
        description: "EXPRESS WORLDWIDE",
        source: "api",
        amount: {
          value: 193.3,
          currency: "EUR"
        },
        meta: {}
      },
      {
        costId: "JpKrR3PggDfp8dnNP",
        isManualBaseCost: false,
        description: "EMERGENCY SITUATION",
        source: "api",
        amount: {
          value: 8.7,
          currency: "EUR"
        },
        meta: {
          chargeCode: "CR"
        }
      },
      {
        costId: "rFRy3NwqyhaWwqJuJ",
        isManualBaseCost: false,
        description: "FUEL SURCHARGE",
        source: "api",
        amount: {
          value: 32.32,
          currency: "EUR"
        },
        meta: {
          chargeCode: "FF"
        }
      }
    ],
    carrierId: DHL_CARRIER_ID,
    createdAt: new Date()

    // dates
    //
  };
};

// example:
/* {
  rateId: "P",
  amount: 234.32,
  currency: "EUR",
  amountLocal: 234.32,
  currencyLocal: "EUR",
  provider: "DHL",
  providerImage75: "https://files.transmate.eu/logos/picking/DHL_logo_rgb.png",
  providerImage200: "https://files.transmate.eu/logos/picking/DHL_logo_rgb.png",
  serviceLevel: {
    name: "EXPRESS Worldwide nondoc",
    token: "P",
    terms: null,
    __typename: "PickingLabelOptionServiceLevel"
  },
  days: 5,
  arrivesBy: 1624924740000,
  durationTerms: null,
  messages: null,
  carrierAccount: null,
  test: null,
  zone: null,
  charges: [
    {
      costId: "o6fLThAWhaWW3uDaj",
      isManualBaseCost: true,
      description: "EXPRESS WORLDWIDE",
      source: "api",
      amount: {
        value: 193.3,
        currency: "EUR"
      },
      meta: {}
    },
    {
      costId: "JpKrR3PggDfp8dnNP",
      isManualBaseCost: false,
      description: "EMERGENCY SITUATION",
      source: "api",
      amount: {
        value: 8.7,
        currency: "EUR"
      },
      meta: {
        chargeCode: "CR"
      }
    },
    {
      costId: "rFRy3NwqyhaWwqJuJ",
      isManualBaseCost: false,
      description: "FUEL SURCHARGE",
      source: "api",
      amount: {
        value: 32.32,
        currency: "EUR"
      },
      meta: {
        chargeCode: "FF"
      }
    }
  ],
  __typename: "PickingLabelOption"
};
*/
