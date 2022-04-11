import moment from "moment";
import { Random } from "/imports/utils/functions/random.js";
import { DEFAULT_OPTION_VALUE } from "../DHL/DHL-utils";

export const mockGetLabelOptions = [
  {
    ...DEFAULT_OPTION_VALUE,
    rateId: "P", // required!!
    serviceType: "P",
    status: "calculated",
    serviceLevel: {
      ...DEFAULT_OPTION_VALUE.serviceLevel,
      name: "SERVICE_LEVEL",
      token: null
    },
    amount: 120.5,
    currency: "EUR",

    // to convert:
    amountLocal: 135,
    currencyLocal: "USD",
    charges: [
      {
        costId: Random.id(),
        isManualBaseCost: false,
        description: "someDescription",
        source: "api",
        amount: {
          value: 135,
          currency: "USD"
        },
        meta: {
          chargeCode: "Some Code"
        }
      }
    ],

    arrivesBy: moment()
      .add(1, "day")
      .startOf("day")
      .toDate(),
    days: 1
  },
  {
    ...DEFAULT_OPTION_VALUE,
    rateId: "P", // required!!
    serviceType: "P",
    status: "calculated",
    serviceLevel: {
      ...DEFAULT_OPTION_VALUE.serviceLevel,
      name: "SERVICE_LEVEL",
      token: null
    },
    amount: 125.5,
    currency: "EUR",

    // to convert:
    amountLocal: 145,
    currencyLocal: "USD",
    charges: [
      {
        costId: Random.id(),
        isManualBaseCost: false,
        description: "someDescription",
        source: "api",
        amount: {
          value: 135,
          currency: "USD"
        },
        meta: {
          chargeCode: "Some Code"
        }
      }
    ],

    arrivesBy: moment()
      .add(2, "day")
      .startOf("day")
      .toDate(),
    days: 2
  }
];
