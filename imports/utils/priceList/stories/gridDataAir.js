export const gridAirData = {
  _id: "erMw7hppX3fvbz2zT",
  customerId: "S65957",
  carrierId: "S65957",
  template: {
    type: "air"
  },
  title: "test2 - S65957 copy",
  currency: "USD",
  category: "standard",
  type: "contract",
  mode: "air",
  validFrom: new Date("2018-09-06T02:00:00.000+02:00"),
  validTo: new Date("2019-09-06T02:00:00.000+02:00"),
  uoms: {
    allowed: ["kg"]
  },
  lanes: [
    {
      name: "Zaventem - BEBRU - ESBCN - Madrid",
      from: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      to: {
        addressIds: ["WJNLceXYjFBdYL4YQ"]
      },
      incoterm: "FCA",
      id: "4rWQ2e"
    },
    {
      name: "test 1",
      id: "4QAktt",
      from: {
        locationIds: ["BEANR"]
      },
      to: {
        locationIds: ["USNYC"]
      },
      incoterm: "FCA"
    },
    {
      name: "test 2",
      id: "YG6kFB",
      from: {
        locationIds: ["BEANR"]
      },
      to: {
        locationIds: ["USNYC"]
      },
      incoterm: "EXW"
    },
    {
      name: "test 3",
      id: "4kYP2m",
      from: {
        locationIds: ["BEANR"]
      },
      to: {
        locationIds: ["BEZAV"]
      },
      incoterm: "FCA"
    },
    {
      name: "test 4",
      id: "merx5z",
      from: {
        locationIds: ["BEANR"]
      },
      to: {
        locationIds: ["BEAAB"]
      },
      incoterm: "FOB"
    },
    {
      name: "test 5",
      id: "MsXGoq",
      from: {
        locationIds: ["NLRTM"]
      },
      to: {
        locationIds: ["BEANR"]
      },
      incoterm: "EXW"
    }
  ],
  volumes: [
    {
      uom: "kg",
      serviceLevel: "LTL",
      ranges: [
        {
          from: 0,
          to: 100,
          id: "c7RAp8"
        },
        {
          from: 100,
          to: 250,
          id: "NK8C9S"
        },
        {
          from: 250,
          to: 500,
          id: "XeHfep"
        },
        {
          from: 500,
          to: 1000,
          id: "DsoSiS"
        },
        {
          from: 1000,
          to: 2000,
          id: "Rtmdf9"
        }
      ],
      id: "Eom2sW"
    }
  ],
  charges: [
    {
      name: "Export Clearance Charge",
      type: "calculated",
      costId: "EQNccsPMgbLpRdK3x",
      currency: "USD",
      min: 10,
      multiplier: "shipment",
      meta: {
        leg: "priliminary"
      },
      id: "mkoPjo"
    },
    {
      name: "Test",
      type: "calculated",
      costId: "EQNccsPMgbLpRdK3x",
      currency: "USD",
      min: 10,
      max: 100,
      multiplier: "shipment",
      meta: {
        leg: "priliminary"
      },
      id: "w896Lp"
    },
    {
      name: "Airfreight",
      type: "calculated",
      costId: "o6fLThAWhaWW3uDaj",
      currency: "EUR",
      multiplier: "kg",
      meta: {
        leg: "main"
      },
      id: "jmfCqg"
    }
  ],
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
  fuelIndexId: "4tg2Rb7pFLDtXv79n",
  created: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2019-01-11T15:51:51.706+01:00")
  },
  creatorId: "S65957",
  status: "for-approval",
  summary: {
    laneCount: 6,
    rateCount: 1
  },
  deleted: false,
  updated: {
    price_lists: "synced"
  }
};
