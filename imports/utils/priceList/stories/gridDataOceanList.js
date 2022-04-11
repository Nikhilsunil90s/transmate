export const gridOceanDataList = {
  _id: "Qg3N9MAfd4PHCs9Jz",
  carrierId: "C100928",
  category: "standard",
  currency: "EUR",
  mode: "ocean",
  terms: {
    days: 30,
    condition: "days"
  },
  title: "Ocean demo pricelist",
  type: "contract",
  validFrom: new Date("2020-12-03T15:13:55.917+01:00"),
  validTo: new Date("2021-12-03T15:13:55.920+01:00"),
  template: {
    type: "custom",
    structure: {
      rows: [
        { field: "laneId" },
        { field: "fromCC" },
        { field: "portOfLoading" },
        { field: "toCC" },
        { field: "portOfDischarge" },
        { field: "incoterm" },
        { field: "equipmentGroupId" }
      ],
      cols: [
        {
          field: "meta.leg"
        },
        {
          field: "costId"
        },
        {
          field: "currency"
        },
        {
          field: "multiplier"
        }
      ],
      page: [],
      tabs: ["rates", "leadTimes", "fuel", "notes", "logic"]
    }
  },
  specialRequirements: [null, null, null],
  uoms: {
    allowed: ["kg"]
  },
  created: {
    by: "K3hqjR5zBoDZRccEx",
    at: new Date("2020-12-03T14:04:06.322+01:00")
  },
  creatorId: "S79207",
  status: "draft",
  carrierName: "MSC Belgium",
  updates: [
    {
      action: "created",
      userId: "K3hqjR5zBoDZRccEx",
      accountId: "S79207",
      ts: new Date("2020-12-03T14:04:06.201+01:00")
    }
  ],
  customerId: "S79207",
  defaultLeadTime: {
    leadTimeHours: 360,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  deleted: false,
  updated: {
    by: "K3hqjR5zBoDZRccEx",
    at: new Date("2020-12-03T15:13:55.988+01:00"),
    price_lists: "synced"
  },
  summary: {
    laneCount: 1,
    rateCount: 1
  },
  lanes: [
    {
      name: "Singapore->Hamburg",
      id: "8nrdiz",
      incoterm: "EXW",
      from: {
        zones: [
          {
            CC: "CN",
            from: "*"
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "DE",
            from: "*"
          }
        ]
      },
      stops: [
        { type: "portOfLoading", locationId: "SGSIN" },
        { type: "portOfDischarge", locationId: "DEHAM" }
      ]
    }
  ],
  equipments: [
    {
      id: "z8C2qs",
      name: "40ft",
      types: ["40G1"]
    },
    {
      id: "z8C2XX",
      name: "20ft",
      types: ["20G0"]
    }
  ],
  charges: [
    {
      name: "Origin Door to Origin Port",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSPf",
      meta: {
        leg: "origin"
      }
    },
    {
      name: "Origin Terminal Handling Fee",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP1",
      meta: {
        leg: "origin"
      }
    },
    {
      name: "Origin Export Customs",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP2",
      meta: {
        leg: "origin"
      }
    },
    {
      name: "Origin BL Fee",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP3",
      meta: {
        leg: "origin"
      }
    },
    {
      name: "Origin Handling Fee",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP4",
      meta: {
        leg: "origin"
      }
    },
    {
      name: "AMS / ENS / ACI",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP5",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "Ocean Freight",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP6",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "Ocean BUC",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP7",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "LSS / Marpol / Green Fuel",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP8",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "Security",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSP9",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "Canal Fees",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA0",
      meta: {
        leg: "ocean"
      }
    },
    {
      name: "Destination THC",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA1",
      meta: {
        leg: "destination"
      }
    },
    {
      name: "Destination Port to Door",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA2",
      meta: {
        leg: "destination"
      }
    },
    {
      name: "Destination Fuel",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA3",
      meta: {
        leg: "destination"
      }
    },
    {
      name: "Destination Handling charges",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA4",
      meta: {
        leg: "destination"
      }
    },
    {
      name: "Destination Document Fee",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA5",
      meta: {
        leg: "destination"
      }
    },
    {
      name: "Destination Port Security",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "USD",
      multiplier: "equipment",
      id: "cdfSA6",
      meta: {
        leg: "destination"
      }
    }
  ]
};

export const gridOceanDataListRates = [
  {
    _id: "5fc8ffd861e184533159d97b",
    meta: {
      source: "table"
    },
    priceListId: "Qg3N9MAfd4PHCs9Jz",
    rules: [
      {
        laneId: "8nrdiz"
      },
      {
        equipmentGroupId: "z8C2qs"
      }
    ],
    rulesUI: {
      chargeId: "cdfSPf"
    },
    amount: {
      unit: "USD",
      value: 1000
    },
    costId: "o6fLThAWhaWW3uDaj",
    laneId: "8nrdiz",
    multiplier: "equipment",
    name: "Origin Door to Origin Port",
    type: "calculated",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "5fc8ffd861e184533159d97b",
    meta: {
      source: "table"
    },
    priceListId: "Qg3N9MAfd4PHCs9Jz",
    rules: [
      {
        laneId: "8nrdiz"
      },
      {
        equipmentGroupId: "z8C2XX"
      }
    ],
    rulesUI: {
      chargeId: "cdfSPf"
    },
    amount: {
      unit: "JPY",
      value: 100000
    },
    costId: "o6fLThAWhaWW3uDaj",
    laneId: "8nrdiz",
    multiplier: "equipment",
    name: "Origin Door to Origin Port",
    type: "calculated",
    updated: {
      price_lists_rates: "synced"
    }
  }
];
