import { Mongo } from "meteor/mongo";

export const tenderBidDoc = () => ({
  _id: new Mongo.ObjectID(),
  tenderBidId: "ZfShR5tEagjq7F5Xk",
  fileId: "p7dZc",
  fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  name: "Example 1.xlsx",
  url:
    "https://s3-eu-central-1.amazonaws.com/files.transmate.eu/documents/tenderify/ZfShR5tEagjq7F5Xk/yBsrJ",
  created: {
    by: "Dsqp3CRYjFpF8rQbh",
    at: new Date("2020-01-09T14:12:06.402Z")
  },
  header: "A11:AM11",
  sheet: "Sheet1",
  type: "file",
  sheets: ["Sheet1", "header"],
  link: "//files.transmate.eu/documents/tenderify/ZfShR5tEagjq7F5Xk/p7dZc",
  mappingH: {
    "0": {
      origin: "ID",
      type: "global",
      target: "lanesId"
    },
    "1": {
      origin: "Load Trade"
    },
    "2": {
      origin: "Load Port Group"
    },
    "3": {
      origin: "Load Country",
      type: "global",
      target: "lanesFromCountry"
    }
  },
  mappingV: {
    lanes: {
      colHeaders: [],
      data: [
        {
          origin: {
            lanesId: 2,
            lanesFromCountry: "Belgium",
            lanesToCountry: "-",
            lanesToCity: "-",
            lanesPOL: "BEANR",
            lanesPOD: "DZALG",
            lanesOriginService: "GI",
            lanesDestinationService: "CY"
          },
          target: {
            lanesId: null,
            lanesFromCountry: "BE",
            lanesToCountry: null,
            lanesToCity: null,
            lanesPOL: "BEANR",
            lanesPOD: "DZALG",
            lanesOriginService: "port",
            lanesDestinationService: "yard"
          }
        },
        {
          origin: {
            lanesId: 4,
            lanesFromCountry: "Belgium",
            lanesToCountry: "-",
            lanesToCity: "-",
            lanesPOL: "BEANR",
            lanesPOD: "DZBJA",
            lanesOriginService: "GI",
            lanesDestinationService: "CY"
          },
          target: {
            lanesId: null,
            lanesFromCountry: "BE",
            lanesToCountry: null,
            lanesToCity: null,
            lanesPOL: "BEANR",
            lanesPOD: "DZBJA",
            lanesOriginService: "port",
            lanesDestinationService: "yard"
          }
        },
        {
          origin: {
            lanesId: 5,
            lanesFromCountry: "Belgium",
            lanesToCountry: "-",
            lanesToCity: "-",
            lanesPOL: "BEANR",
            lanesPOD: "DZORN",
            lanesOriginService: "GI",
            lanesDestinationService: "CY"
          },
          target: {
            lanesId: null,
            lanesFromCountry: "BE",
            lanesToCountry: null,
            lanesToCity: null,
            lanesPOL: "BEANR",
            lanesPOD: "DZORN",
            lanesOriginService: "port",
            lanesDestinationService: "yard"
          }
        }
      ]
    },
    equipments: {
      colHeaders: [],
      data: [
        {
          origin: {
            equipmentType: "20dc"
          },
          target: {
            equipmentType: "20G0"
          }
        },
        {
          origin: {
            equipmentType: "40dc"
          },
          target: {
            equipmentType: "40G0"
          }
        }
      ]
    },
    charges: {
      colHeaders: [],
      data: [
        {
          origin: {
            chargeDescription: "OCEAN RATE",
            chargeCurrency: null,
            chargeMultiplier: "equipment",
            chargeValidFrom: "start date contract",
            chargeValidTo: "end date contract"
          },
          target: {
            chargeDescription: "doc/bl",
            chargeCurrency: null,
            chargeMultiplier: null,
            chargeValidFrom: null,
            chargeValidTo: null
          }
        },
        {
          origin: {
            chargeDescription: "OCEAN RATE",
            chargeCurrency: null,
            chargeMultiplier: "equipment",
            chargeValidFrom: "start date contract",
            chargeValidTo: "end date contract"
          },
          target: {
            chargeDescription: "main/freight",
            chargeCurrency: null,
            chargeMultiplier: null,
            chargeValidFrom: null,
            chargeValidTo: null
          }
        }
      ]
    }
  }
});
