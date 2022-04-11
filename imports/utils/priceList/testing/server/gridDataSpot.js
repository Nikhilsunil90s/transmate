import moment from "moment";

export const priceListdocSpot = {
  _id: "QgEDbGepecvQxXf2Y",
  customerId: "S56205",
  carrierId: "C02348",
  template: {
    type: "spot"
  },
  title: "spot template",
  currency: "EUR",
  category: "standard",
  type: "contract",
  mode: "road",
  validFrom: moment()
    .startOf("day")
    .subtract(1, "year")
    .toDate(),
  validTo: moment()
    .startOf("day")
    .add(1, "year")
    .toDate(),
  uoms: {
    allowed: ["kg"]
  },

  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  specialRequirements: [],
  terms: {
    days: 30,
    condition: "days"
  },

  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: "2019-03-27T16:17:26.967Z"
  },
  creatorId: "S56205",
  status: "active",
  summary: {
    laneCount: 3,
    rateCount: 19
  },
  carrierName: "GLS Belgium NV/SA",

  // specific spot:
  shipments: [
    {
      shipmentId: "zsjtZz7fn8hAimx7T",
      params: {
        from: { zipCode: "3980", countryCode: "BE" },
        to: { zipCode: "3077AW", countryCode: "NL" },
        date: "2018-10-06",
        goods: { quantity: { kg: 3.7 } },
        equipments: [],
        targetCurrency: "EUR"
      }
    },
    {
      shipmentId: "zsjtZz7fn8hAimx7X",
      params: {
        from: { zipCode: "3980", countryCode: "BE" },
        to: { zipCode: "2030AR", countryCode: "NL" },
        date: "2018-10-06",
        goods: { quantity: { kg: 10 } },
        equipments: [],
        targetCurrency: "EUR"
      }
    }
  ],
  charges: [
    {
      id: "kvrTMnuzXcpMvACTg",
      name: "Base rate",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "EUR",
      multiplier: "shipment"
    },
    {
      id: "3vww2WBhcL7xRPWjx",
      name: "fuel cost",
      type: "calculated",
      costId: "tKriCZxRiHQBCZ8ZB",
      currency: "EUR",
      multiplier: "shipment"
    },
    {
      id: "z3G9DwtDfKmhSiNWy",
      name: "road tax",
      type: "calculated",
      costId: "2oCaqqYeje5kps2Si",
      currency: "EUR",
      multiplier: "shipment"
    }
  ]
};
