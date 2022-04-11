import { Random } from "/imports/utils/functions/random.js";
import { LabelType } from "../DHL/interfaces.d";

// some labels that have been generated:
const LABEL_URL =
  "https://s3.eu-central-1.amazonaws.com/files.transmate.eu/pickingLabels/label-28yamSmr5EBgedLXJ.pdf";
const CARRIER_ID = "C00001";

interface Mock {
  label: LabelType;
  trackingNumbers: { [k: string]: string };
  rateRequest: Object;
  operationType: string;
}

export const mockConfirmLabelOption: (a: {
  items: Array<{ id: string }>;
}) => Mock = ({ items }) => ({
  label: {
    labelUrl: LABEL_URL,
    carrierId: CARRIER_ID,
    status: "created",
    createdAt: new Date(),
    costs: [
      {
        costId: "o6fLThAWhaWW3uDaj",
        isManualBaseCost: true,
        description: "EXPRESS WORLDWIDE",
        source: "api",
        amount: {
          value: 14.1,
          currency: "EUR"
        },
        meta: {}
      },
      {
        costId: "JpKrR3PggDfp8dnNP",
        isManualBaseCost: false,
        description: "REMOTE AREA",
        source: "api",
        amount: {
          value: 0.6,
          currency: "EUR"
        },
        meta: {
          chargeCode: "OF"
        }
      },
      {
        costId: "Swqu9Pnh4ypZFTXeL",
        isManualBaseCost: false,
        description: "EMERGENCY SITUATION",
        source: "api",
        amount: {
          value: 1.08,
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
          value: 3.35,
          currency: "EUR"
        },
        meta: {
          chargeCode: "FF"
        }
      }
    ]
  },
  trackingNumbers: items.reduce((acc, cur) => {
    acc[cur.id] = Random.id();
    return acc;
  }, {}),
  rateRequest: {},
  operationType: "DHL-direct"
});
