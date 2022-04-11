export const shipmentDoc = {
  _id: "zsjtZz7fn8hAimx7T",
  serviceLevel: "LTL",
  status: "draft",
  references: {
    number: "gls_parcel|27746"
  },
  notes: {
    BookingNotes: "73629007117",
    LoadingNotes: "GLS Parcel ALL 2018-10 (1).xlsx",
    OtherNotes: "IFB8050879_20181105",
    PlanningNotes: "27745"
  },
  accountId: "S56205",
  type: "road",
  incoterm: "DDP",
  created: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date("2019-03-22T20:03:38.951+01:00")
  },
  number: "BUTYK9ML",
  shipperId: "S56205",
  pickup: {
    location: {
      isValidated: true,
      name: "STANLEY BLACK & DECKER",
      countryCode: "BE",
      zipCode: "3980",
      address: {
        city: "TESSENDERLO",
        street: "kaai laan",
        number: 12
      },
      latLng: {
        lat: 51.0667,
        lng: 5.0833
      }
    },
    date: new Date("2018-10-06T02:00:00.000+02:00"),
    datePlanned: new Date("2018-10-06T02:00:00.000+02:00"),
    dateScheduled: new Date("2018-10-06T02:00:00.000+02:00"),
    dateActual: new Date("2018-10-06T02:00:00.000+02:00")
  },
  delivery: {
    location: {
      isValidated: false,
      name: "KONINKLIJKE PEITSMAN B.V.",
      countryCode: "NL",
      zipCode: "3077AW",
      address: {
        city: "ROTTERDAM",
        street: "kaai laan"
      }
    },
    date: new Date("2018-10-06T02:00:00.000+02:00"),
    datePlanned: new Date("2018-10-06T02:00:00.000+02:00"),
    dateScheduled: new Date("2018-10-06T02:00:00.000+02:00"),
    dateActual: new Date("2018-10-06T02:00:00.000+02:00")
  },
  updated: {
    by: "Gi9g3pMAsMkzXEaRk",
    at: new Date("2019-03-22T20:03:38.951+01:00")
  },
  carrierIds: ["C02348"],
  stageIds: ["QAa3EgXugY8KnXAQf"],
  flags: ["has-invoice", "has-costs"],
  costParams: {
    exchangeDate: "2018-10-06",
    calcResults: {
      resultCount: 1,
      timestamp: new Date("2019-03-22T20:03:39.135+01:00")
    }
  },
  costs: [
    {
      id: "Q8HPEP",
      costId: "fM7Tt2MMnMz9QdCE4",
      description: "Manual data entry",
      tooltip: "Lane: NL, 0.36 EUR/shipment",
      amount: {
        value: 0.36,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "IMW5Q9",
      costId: "tKriCZxRiHQBCZ8XY",
      description: "administration fee",
      tooltip: "Lane: NL, 10 EUR/bl",
      amount: {
        value: 10,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "RJPXMB",
      costId: "8gztvmnJKQvfkJp2B",
      description: "kilometer toll",
      tooltip: "Lane: NL, 6.94 %/rate",
      amount: {
        value: 1.236,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "RCHWWP",
      costId: "DBCiH2w9QhxvmumB8",
      description: "Cancellation of a pick-up order",
      tooltip: "Lane: NL, 10.04 EUR/order",
      amount: {
        value: 1,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "RHDRQW",
      costId: "khL5y9Fw3a4M7pPST",
      description: "Driver waiting time",
      tooltip: "Lane: NL, 10.92 EUR/hour",
      amount: {
        value: 0,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "EDPLXR",
      costId: "XrvjwKhATZ5Qpu6Rw",
      description: "Notification of non-delivery",
      tooltip: "Lane: NL, 5.08 EUR/bl",
      amount: {
        value: 5.08,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "DMWVEK",
      costId: "tKriCZxRiHQBCZ8ZZ",
      description: "Proof of delivery",
      tooltip: "Lane: NL, 5.08 EUR/bl",
      amount: {
        value: 5.08,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.134+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "FGGC95",
      costId: "SuobsSTMcRGd6ex6G",
      description: "Manual labelling",
      tooltip: "Lane: NL, 0 EUR/bl",
      amount: {
        value: 0,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.135+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "YBGHNQ",
      costId: "kj2bpBmbkJwE4dFQZ",
      description: "On-date delivery",
      tooltip: "Lane: NL, 10 %/subtotal",
      amount: {
        value: 0,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.135+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "SBDTEI",
      costId: "QKjnhMZeCv2ecvuGR",
      description: "Additional parcels (looseload) (2 parcels and more)",
      tooltip: "Lane: NL, 3.5 EUR/pc",
      amount: {
        value: 1,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.135+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "R2EMSP",
      costId: "o6fLThAWhaWW3uDaj",
      description: "base rate",
      tooltip: "Lane: NL, 17.81 EUR/shipment",
      amount: {
        value: 17.81,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.135+01:00")
      },
      accountId: "S56205"
    },
    {
      id: "MBEST9",
      costId: "rFRy3NwqyhaWwqJuJ",
      description: "fuel",
      tooltip: "7 %/rate",
      amount: {
        value: 1.2467,
        currency: "EUR"
      },
      source: "priceList",
      priceListId: "36GQHxA88GrP8KLMR",
      added: {
        by: "Gi9g3pMAsMkzXEaRk",
        at: new Date("2019-03-22T20:03:39.135+01:00")
      },
      accountId: "S56205"
    }
  ]
};

export const stageDoc = {
  _id: "QAa3EgXugY8KnXAQf",
  dates: {
    delivery: {
      arrival: {
        actual: new Date("2018-10-06T02:00:00.000+02:00"),
        planned: new Date("2018-10-06T02:00:00.000+02:00"),
        scheduled: new Date("2018-10-06T02:00:00.000+02:00")
      }
    },
    pickup: {
      arrival: {
        actual: new Date("2018-10-06T02:00:00.000+02:00"),
        planned: new Date("2018-10-06T02:00:00.000+02:00"),
        scheduled: new Date("2019-03-22T20:03:38.950+01:00")
      }
    }
  },
  status: "draft",
  mode: "road",
  carrierId: "C02348",
  shipmentId: "zsjtZz7fn8hAimx7T",
  from: {
    isValidated: true,
    name: "STANLEY BLACK & DECKER",
    countryCode: "BE",
    zipCode: "3980",
    address: {
      city: "TESSENDERLO"
    },
    latLng: {
      lat: 51.0667,
      lng: 5.0833
    }
  },
  to: {
    isValidated: false,
    name: "KONINKLIJKE PEITSMAN B.V.",
    countryCode: "NL",
    zipCode: "3077AW",
    address: {
      city: "ROTTERDAM"
    }
  }
};

export const nestedItemDocs = [
  {
    _id: "Fe9FSDyJjFC2NnfRS",
    shipmentId: "zsjtZz7fn8hAimx7T",
    level: 0,
    quantity: {
      amount: 10,
      code: "20GE"
    },
    type: "TU",
    description: "20 ft container",
    references: {
      containerNo: "102",
      truckId: "102"
    },
    DG: true,
    weight_net: 1000,
    weight_gross: 1200,
    weight_unit: "kg",
    calcSettings: {
      costRelevant: true,
      itemize: true
    }
  },
  {
    _id: "dbALKAkJMKbu9enah",
    shipmentId: "zsjtZz7fn8hAimx7T",
    level: 1,
    parentItemId: "Fe9FSDyJjFC2NnfRS",
    quantity: {
      amount: 10,
      code: "PAL"
    },
    type: "HU",
    description: "testing pallet",
    taxable: [
      {
        type: "pal",
        quantity: 10
      }
    ],
    weight_gross: 100,
    weight_net: 80,
    weight_unit: "kg",
    calcSettings: {
      costRelevant: false,
      itemize: false
    }
  },
  {
    _id: "dbALKAkJMKbu9enXX",
    shipmentId: "zsjtZz7fn8hAimx7T",
    level: 1,
    parentItemId: "Fe9FSDyJjFC2NnfRS",
    quantity: {
      amount: 200,
      code: "PAL"
    },
    type: "HU",
    description: "testing pallet",

    taxable: [
      {
        type: "pal",
        quantity: 10
      }
    ],
    weight_gross: 100,
    weight_net: 80,
    weight_unit: "kg",
    calcSettings: {
      costRelevant: false,
      itemize: false
    }
  },
  {
    _id: "zLs4W6phsvsDQhSTJ",
    shipmentId: "zsjtZz7fn8hAimx7T",
    level: 0,
    quantity: {
      amount: 100,
      code: "20GE"
    },
    type: "TU",
    description: "test",
    calcSettings: {
      costRelevant: true,
      itemize: true
    }
  }
];

export const simulationDoc = {
  simulation: {
    result: {
      air: {
        results: [null]
      },
      road: {
        results: [
          {
            steps: [
              {
                CO2: 3305.4012000000007,
                days: 1.0801964705882354,
                durationHours: 11.358333333333333,
                from: {
                  country: "FR",
                  countryCode: "FR",
                  lat: 48.52203,
                  lng: -3.48712,
                  zip: "22780"
                },
                hours: 11.358333333333333,
                km: 918.167,
                mode: "road",
                to: {
                  country: "NL",
                  countryCode: "NL",
                  lat: 51.81271,
                  lng: 5.24476,
                  zip: "5301 AR"
                },
                type: "FTL"
              }
            ],
            totalCO2: 3305.4012000000007,
            totalCost: 1456.052456,
            totalHours: 11.358333333333333,
            totalKm: 918.167,
            totalLeadtime: 2
          }
        ]
      },
      sea: {
        results: [
          {
            steps: [
              {
                CO2: 1387.9728,
                cost: 727.429664,
                days: 0.45358588235294117,
                from: {
                  country: "FR",
                  zip: "22780"
                },
                hours: 4.990833333333333,
                km: 385.548,
                mode: "road",
                to: {
                  country: "FR",
                  locode: "FRLEH"
                },
                type: "FTL"
              },
              {
                CO2: 277.8,
                cost: 511.112,
                days: 2,
                from: {
                  country: "FR",
                  locode: "FRLEH"
                },
                hours: 48,
                km: 463,
                mode: "sea",
                to: {
                  country: "NL",
                  locode: "NLRTM"
                },
                type: "40ft"
              },
              {
                CO2: 246.762,
                cost: 293.76956,
                days: 0.20795138888888887,
                from: {
                  country: "NL",
                  locode: "NLRTM"
                },
                hours: 4.990833333333333,
                km: 68.545,
                mode: "road",
                to: {
                  country: "NL",
                  zip: "5301 AR"
                },
                type: "FTL"
              }
            ],
            totalCO2: 1912.5348,
            totalCost: 1532.311224,
            totalHours: 57.98166666666667,
            totalKm: 917.093,
            totalLeadtime: 3
          }
        ]
      }
    }
  }
};
