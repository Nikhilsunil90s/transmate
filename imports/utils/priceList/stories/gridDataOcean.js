export const gridOceanData = {
  _id: "yQsqg7Ca7MYKjz5ze",
  carrierId: "C17262",
  category: "standard",
  currency: "EUR",
  mode: "ocean",
  terms: {
    days: 30,
    condition: "days"
  },
  title: "New PriceList 2019-12-09",
  type: "contract",
  validFrom: new Date("2019-12-09T01:00:00.000+01:00"),
  validTo: new Date("2020-12-09T01:00:00.000+01:00"),
  template: {
    type: "ocean"
  },
  specialRequirements: [],
  uoms: {
    allowed: ["pal", "kg", "m3", "lm", "l", "pc", "parcel"]
  },
  created: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2019-12-09T09:50:00.800+01:00")
  },
  creatorId: "S65957",
  status: "draft",
  carrierName: "CMA-CGM",
  customerId: "S65957",
  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  deleted: false,
  updated: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2019-12-09T09:51:22.575+01:00"),
    price_lists: "synced"
  },
  summary: {
    laneCount: 1,
    rateCount: 1
  },
  lanes: [
    {
      name: "test",
      id: "yjXFb3",
      from: {
        addressIds: ["zreDFczhs6NCvy6En"]
      },
      to: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      incoterm: "EXW"
    }
  ],
  charges: [
    {
      id: "LmJcXaLxXY29xb9mm",
      name: "test charge",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "EUR",
      multiplier: "pal"
    }
  ],
  equipments: [
    {
      name: "test equipment",
      types: ["40GE"],
      id: "gfMXWM"
    },
    {
      name: "test equipment 2",
      types: ["45GE"],
      id: "gfMXWX"
    }
  ]
};

export const gridOceanDataRates = [
  {
    _id: "zYPXgthXxSuB3XAqK",
    amount: {
      unit: "EUR",
      value: 100
    },
    costId: "o6fLThAWhaWW3uDaj",
    meta: {
      source: "table"
    },
    multiplier: "shipment",
    name: "test",
    priceListId: "yQsqg7Ca7MYKjz5ze",
    rules: [
      {
        equipmentGroupId: "gfMXWM"
      },
      {
        laneId: "yjXFb3"
      }
    ],
    rulesUI: {
      chargeId: "LmJcXaLxXY29xb9mm"
    },
    type: "calculated",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "zYPXgthXxSuB3XAXX",
    amount: {
      unit: "EUR",
      value: 200
    },
    costId: "o6fLThAWhaWW3uDaj",
    meta: {
      source: "table"
    },
    multiplier: "shipment",
    name: "test",
    priceListId: "yQsqg7Ca7MYKjz5ze",
    rules: [
      {
        equipmentGroupId: "gfMXWX"
      },
      {
        laneId: "yjXFb3"
      }
    ],
    rulesUI: {
      chargeId: "LmJcXaLxXY29xb9mm"
    },
    type: "calculated",
    updated: {
      price_lists_rates: "synced"
    }
  }
];
