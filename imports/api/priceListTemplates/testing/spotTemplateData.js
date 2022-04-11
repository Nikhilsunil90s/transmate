export const spotTemplateDataDB = {
  _id: "TEMPL:SPOT-SHIPM",
  title: "Spot template",
  description: "Generic template for spot rates",
  public: true,

  // accountSpecific: "",
  // creatorId: "",
  // customerId: "",
  // carrierId: "",
  template: {
    type: "spot"
  },

  currency: "EUR",
  category: "standard",
  type: "spot",
  mode: "road",

  // validFrom: "",
  // validTo: "",
  uoms: {
    allowed: ["kg"]
  },

  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  terms: {
    days: 30,
    condition: "days"
  },
  status: "draft",

  // specific spot:
  shipments: [],
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
    }
  ]
};
