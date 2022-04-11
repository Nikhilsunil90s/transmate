export const shipmentDoc = {
  _id: "48NrcF7w25YuEDPSe",
  deleted: false,
  serviceLevel: "LTL",
  status: "draft",
  references: {
    number: "MSC_IMPORT|MEDUN1606072",
    fa: "FK905X"
  },
  accountId: "S56205",
  type: "ocean",
  incoterm: "DDP",
  number: "YUHHYEAI",
  shipperId: "S56205",
  pickup: {
    location: {
      isValidated: true,
      countryCode: "CN",
      locode: {
        id: "CNNBO",
        code: "NBO"
      },
      latLng: {
        lat: 29.866666666666667,
        lng: 121.55
      }
    },
    date: new Date("2019-02-04T01:00:00.000+01:00")
  },
  delivery: {
    location: {
      isValidated: true,
      countryCode: "AE",
      locode: {
        id: "AEJEA",
        code: "JEA"
      }
    },
    date: new Date("2019-02-04T01:00:00.000+01:00")
  },
  carrierIds: ["C100928"],
  stageIds: ["rP3bxPCPpxpLKA5zv"],
  itemIds: ["HSdL39JtKpJNr6JB7"],
  sphericalDistance: 0,
  flags: ["has-invoice"],
  equipments: [
    {
      quantity: 1,
      type: "20GE"
    },
    {
      quantity: 1,
      type: "40GE"
    }
  ],
  costParams: {},
  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date("2019-07-04T14:14:17.712+02:00")
  },
  updated: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date("2019-07-04T14:14:17.712+02:00")
  }
};

export const stageDoc = {
  _id: "rP3bxPCPpxpLKA5zv",
  from: {
    isValidated: true,
    countryCode: "CN",
    locode: {
      id: "CNNBO",
      code: "NBO"
    },
    latLng: {
      lat: 29.866666666666667,
      lng: 121.55
    }
  },
  to: {
    isValidated: true,
    countryCode: "AE",
    locode: {
      id: "AEJEA",
      code: "JEA"
    }
  },
  dates: {
    delivery: {
      arrival: {
        actual: new Date("2019-07-04T14:14:17.712+02:00"),
        planned: new Date("2019-02-04T01:00:00.000+01:00"),
        scheduled: new Date("2019-07-04T14:14:17.712+02:00")
      }
    },
    pickup: {
      arrival: {
        actual: new Date("2019-02-04T01:00:00.000+01:00"),
        planned: new Date("2019-02-04T01:00:00.000+01:00"),
        scheduled: new Date("2019-07-04T14:14:17.712+02:00")
      }
    }
  },
  mode: "ocean",
  status: "draft",
  carrierId: "C100928",
  shipmentId: "48NrcF7w25YuEDPSe"
};

export const itemData = {
  _id: "HSdL39JtKpJNr6JB7",
  shipmentId: "48NrcF7w25YuEDPSe",
  quantity: 1,
  quantity_unit: "PC",
  weight_gross: 0,
  weight_net: 0,
  weight_unit: "kg"
};
