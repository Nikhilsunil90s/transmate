export const priceListRateDocsSpot = [
  {
    _id: "tKriCZxRiHQBCZ8ZB",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 100 },
    laneId: null,
    name: "Base rate",
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7T" }],
    currency: "EUR",
    rulesUI: { chargeId: "kvrTMnuzXcpMvACTg" },
    priceListId: "QgEDbGepecvQxXf2Y"
  },

  /* 2 */
  {
    _id: "tKriCZxRiHQBCZ8ZC",
    type: "calculated",
    costId: "tKriCZxRiHQBCZ8ZB",
    multiplier: "shipment",
    amount: { value: 100 },
    laneId: null,
    name: "fuel cost",
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7T" }],
    currency: "EUR",
    rulesUI: { chargeId: "3vww2WBhcL7xRPWjx" },
    priceListId: "QgEDbGepecvQxXf2Y"
  },

  /* 3 */
  {
    _id: "tKriCZxRiHQBCZ8ZD",
    type: "calculated",
    costId: "2oCaqqYeje5kps2Si",
    multiplier: "shipment",
    amount: { value: 100 },
    name: "road tax",
    laneId: null,
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7T" }],
    currency: "EUR",
    rulesUI: { chargeId: "z3G9DwtDfKmhSiNWy" },
    priceListId: "QgEDbGepecvQxXf2Y"
  },

  /* 4 */
  {
    _id: "tKriCZxRiHQBCZ8ZE",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "shipment",
    amount: { value: 100 },
    laneId: null,
    name: "Base rate",
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7X" }],
    currency: "EUR",
    rulesUI: { chargeId: "kvrTMnuzXcpMvACTg" },
    priceListId: "QgEDbGepecvQxXf2Y"
  },

  /* 5 */
  {
    _id: "tKriCZxRiHQBCZ8ZF",
    type: "calculated",
    costId: "tKriCZxRiHQBCZ8ZB",
    multiplier: "shipment",
    amount: { value: 100 },
    laneId: null,
    name: "fuel cost",
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7X" }],
    currency: "EUR",
    rulesUI: { chargeId: "3vww2WBhcL7xRPWjx" },
    priceListId: "QgEDbGepecvQxXf2Y"
  },

  /* 6 */
  {
    _id: "tKriCZxRiHQBCZ8ZG",
    type: "calculated",
    costId: "2oCaqqYeje5kps2Si",
    multiplier: "shipment",
    laneId: null,
    amount: { value: 100 },
    name: "road tax",
    meta: { source: "table" },
    rules: [{ shipmentId: "zsjtZz7fn8hAimx7X" }],
    currency: "EUR",
    rulesUI: { chargeId: "z3G9DwtDfKmhSiNWy" },
    priceListId: "QgEDbGepecvQxXf2Y"
  }
];
