export const gridRoadData = {
  _id: "n8pYLq3LEzZDHqYS4",
  title: "Belgium - Spain - Standard",
  template: {
    type: "road"
  },
  customerId: "S65957",
  carrierId: "C69205",
  mode: "road",
  category: "standard",
  type: "contract",
  currency: "EUR",
  validFrom: new Date("2018-09-03T02:00:00.000+02:00"),
  validTo: new Date("2019-09-04T02:00:00.000+02:00"),
  terms: {
    days: 30,
    condition: "days"
  },
  specialRequirements: [],
  uoms: {
    allowed: ["pal"]
  },
  status: "draft",
  created: {
    by: "jsBor6o3uRBTFoRQY",
    at: new Date("2018-09-04T21:51:21.092+02:00")
  },
  creatorId: "S65957",
  defaultLeadTime: {
    leadTimeHours: 24,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  volumes: [
    {
      uom: "pal",
      serviceLevel: "LTL",
      ranges: [
        {
          from: 1,
          to: 5,
          id: "k7REAw"
        },
        {
          from: 5,
          to: 10,
          id: "wDr2mw"
        },
        {
          from: 11,
          to: 15,
          id: "Ant3aM"
        },
        {
          from: 16,
          to: 20,
          id: "a4AL5w"
        },
        {
          from: 20,
          to: 25,
          id: "EBeXEH"
        },
        {
          from: 25,
          to: 99,
          id: "4oRMGL"
        }
      ],
      id: "aTmCfn"
    }
  ],
  lanes: [
    {
      name: "Granada",
      from: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      to: {
        zones: [
          {
            CC: "ES",
            from: "18000",
            to: "18999"
          }
        ]
      },
      incoterm: "FCA",
      id: "yEuMxg"
    },
    {
      name: "Huelva",
      from: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      to: {
        zones: [
          {
            CC: "ES",
            from: "21000",
            to: "21999"
          }
        ]
      },
      incoterm: "FCA",
      id: "DHMZJE"
    },
    {
      name: "Lleida",
      from: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      to: {
        zones: [
          {
            CC: "ES",
            from: "25000",
            to: "25999"
          }
        ]
      },
      incoterm: "FCA",
      id: "77jrgq"
    },
    {
      name: "Madrid",
      from: {
        addressIds: ["j958tYA872PAogTDq"]
      },
      to: {
        zones: [
          {
            CC: "ES",
            from: "28000",
            to: "28999"
          }
        ]
      },
      incoterm: "FCA",
      id: "2XdwHd"
    }
  ],
  fuelIndexId: "9Wwis9MDy2hhXi2tb",
  carrierName: "Joep Transport"
};

export const gridRoadDataRates = [
  {
    _id: "ywDLM6aSGo3TdXCvT",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 104,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "Ant3aM"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "wN8Ghm9XD7Tb9FovE",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 99,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "Ant3aM"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "t6rTcfg9EFAeHoJux",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 117,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "wDr2mw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "jTupbintMpwRr7crE",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 97,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "a4AL5w"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "f2P9iEAiWM8JrcT9f",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 115,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "k7REAw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "dXShrTrSgjDNrYQF5",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 110,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "k7REAw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "boPYncyzfdtet4NpR",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 95,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "EBeXEH"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "asY7tNL4oaTwDGNdq",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 109,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "Ant3aM"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "Xx9PFXoeiffhi26zy",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 105,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "4oRMGL"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "QoDQv8E98x7axfn7f",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 114,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "Ant3aM"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "QayED6kW6Zhh6cvLv",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 112,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "wDr2mw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "MGYAzYhmpCZZmeH6E",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 106,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "a4AL5w"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "LiZPnJ5kokhtH7bKG",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 107,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "wDr2mw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "Kx7coL2e8PsoTtSG8",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 100,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "4oRMGL"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "KhcJCspGtobwSuZZy",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 102,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "wDr2mw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "HnjfznpkRqHkzcsHE",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 120,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "k7REAw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "HedKq7nv6qZfukCic",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 103,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "2XdwHd"
      },
      {
        volumeRangeId: "EBeXEH"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "DQKoagFaoLZbqCZJA",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 93,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "4oRMGL"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "DHMZJE",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "DJZPhMzmLngg49jXS",
    priceListId: "n8pYLq3LEzZDHqYS4",
    name: "success fee",
    type: "calculated",
    costId: "d2FNtiSkP23MaLwiq",
    multiplier: "shipment",
    amount: {
      value: 10,
      unit: "%"
    },
    rules: [],
    laneId: null,
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "DEfS4i27iLDdXMvcj",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 96,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "4oRMGL"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "yEuMxg",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "CWabxxksv5haKriMY",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 101,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "a4AL5w"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "yEuMxg",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "CAzRSjsm93fxesQPd",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 98,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "yEuMxg"
      },
      {
        volumeRangeId: "EBeXEH"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "yEuMxg",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "9nRevS3DN5T7AKzip",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 111,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "a4AL5w"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "77jrgq",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "9LQScFD3zQ6NDrjPy",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 108,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "77jrgq"
      },
      {
        volumeRangeId: "EBeXEH"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "77jrgq",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "48gnie4ujxcxz2AJE",
    priceListId: "n8pYLq3LEzZDHqYS4",
    type: "calculated",
    costId: "o6fLThAWhaWW3uDaj",
    multiplier: "pal",
    amount: {
      value: 105,
      unit: "EUR"
    },
    meta: {
      source: "table"
    },
    rules: [
      {
        laneId: "DHMZJE"
      },
      {
        volumeRangeId: "k7REAw"
      },
      {
        volumeGroupId: "aTmCfn"
      }
    ],
    laneId: "DHMZJE",
    updated: {
      price_lists_rates: "synced"
    }
  },
  {
    _id: "2BMeyzTRHYsAKDHLM",
    priceListId: "n8pYLq3LEzZDHqYS4",
    name: "Booking Cost",
    type: "calculated",
    costId: "5kfrk35RJYc4Gja36",
    multiplier: "shipment",
    amount: {
      value: 5,
      unit: "EUR"
    },
    rules: [],
    laneId: null,
    updated: {
      price_lists_rates: "synced"
    }
  }
];
