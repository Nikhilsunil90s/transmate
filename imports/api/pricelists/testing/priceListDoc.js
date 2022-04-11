export const priceListDoc = {
  _id: "vFFTaBYAjoRWREktR",
  base: "lm",
  creatorId: "S41452",
  customerId: "S41452",
  carrierId: "C86375",
  template: {
    type: "road"
  },
  title: "Invacare LTL/FTL PT->EU 2019",
  currency: "EUR",
  category: "standard",
  type: "contract",
  mode: "road",
  validFrom: new Date("2019-07-01T02:00:00.000+02:00"),
  validTo: new Date("2020-06-30T02:00:00.000+02:00"),
  uoms: {
    allowed: ["lm"]
  },
  lanes: [
    {
      id: "HL2aF4",
      laneGroup: "",
      name: "Fondettes,FR",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "FR",
            from: "37230",
            to: ""
          }
        ]
      }
    },
    {
      id: "YpRZxu",
      laneGroup: "",
      name: "HALLUIN,FR",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "FR",
            from: "59520",
            to: ""
          }
        ]
      }
    },
    {
      id: "s3wgs4",
      laneGroup: "",
      name: "Porta Westfalica,DE",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "DE",
            from: "32457",
            to: ""
          }
        ]
      }
    },
    {
      id: "faXqBA",
      laneGroup: "",
      name: "THIENE-VICENZA,IT",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "IT",
            from: "36016",
            to: ""
          }
        ]
      }
    },
    {
      id: "xcv2HA",
      laneGroup: "",
      name: "Lisse/Capelle,NL",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "NL",
            from: "21",
            to: "29"
          }
        ]
      }
    },
    {
      id: "FMoPrs",
      laneGroup: "",
      name: "Almhut/Dio,SE",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "SE",
            from: "34",
            to: "35"
          }
        ]
      }
    },
    {
      id: "ZxioFr",
      laneGroup: "",
      name: "Bridgend,UK",
      from: {
        zones: [
          {
            CC: "PT",
            from: "*",
            to: ""
          }
        ]
      },
      to: {
        zones: [
          {
            CC: "GB",
            from: "CF35",
            to: "CF35"
          }
        ]
      }
    }
  ],
  volumes: [
    {
      id: "NBpiPF",
      uom: "lm",
      serviceLevel: "LTL",
      ranges: [
        {
          id: "Ntcjau",
          from: 2.5,
          to: 3,
          name: "2.5 - 3LM",
          multiplier: "shipment"
        },
        {
          id: "6KZPMZ",
          from: 3,
          to: 3.5,
          name: "3 - 3.5LM",
          multiplier: "shipment"
        },
        {
          id: "7BkpjS",
          from: 3.5,
          to: 4,
          name: "3.5 - 4LM",
          multiplier: "shipment"
        },
        {
          id: "nHKP6h",
          from: 4,
          to: 4.5,
          name: "4 - 4.5LM",
          multiplier: "shipment"
        },
        {
          id: "DBabyx",
          from: 4.5,
          to: 5,
          name: "4.5 - 5LM",
          multiplier: "shipment"
        },
        {
          id: "ye7bQ2",
          from: 5,
          to: 5.5,
          name: "5 - 5.5LM",
          multiplier: "shipment"
        },
        {
          id: "PgThKF",
          from: 5.5,
          to: 6,
          name: "5.5 - 6LM",
          multiplier: "shipment"
        },
        {
          id: "r9e997",
          from: 6,
          to: 6.5,
          name: "6 - 6.5LM",
          multiplier: "shipment"
        },
        {
          id: "H9AKb6",
          from: 6.5,
          to: 7,
          name: "6.5 - 7LM",
          multiplier: "shipment"
        },
        {
          id: "XAJTSY",
          from: 7,
          to: 7.5,
          name: "7 - 7.5LM",
          multiplier: "shipment"
        },
        {
          id: "uez9pG",
          from: 7.5,
          to: 8,
          name: "7.5 - 8LM",
          multiplier: "shipment"
        },
        {
          id: "5cTMTA",
          from: 8,
          to: 8.5,
          name: "8 - 8.5LM",
          multiplier: "shipment"
        },
        {
          id: "sAQtGi",
          from: 8.5,
          to: 9,
          name: "8.5 - 9LM",
          multiplier: "shipment"
        },
        {
          id: "2gKTH9",
          from: 9,
          to: 9.5,
          name: "9 - 9.5LM",
          multiplier: "shipment"
        },
        {
          id: "uFW9jt",
          from: 9.5,
          to: 10,
          name: "9.5 - 10LM",
          multiplier: "shipment"
        },
        {
          id: "5uCfDn",
          from: 10,
          to: 10.5,
          name: "10 - 10.5LM",
          multiplier: "shipment"
        },
        {
          id: "hxRJZN",
          from: 10.5,
          to: 11,
          name: "10.5 - 11LM",
          multiplier: "shipment"
        },
        {
          id: "XQJWTW",
          from: 11,
          to: 11.5,
          name: "11 - 11.5LM",
          multiplier: "shipment"
        },
        {
          id: "3kGJ4P",
          from: 11.5,
          to: 12,
          name: "11.5 - 12LM",
          multiplier: "shipment"
        },
        {
          id: "FAMTdw",
          from: 12,
          to: 12.5,
          name: "12 - 12.5LM",
          multiplier: "shipment"
        },
        {
          id: "8gTND6",
          from: 12.5,
          to: 15,
          name: "full truck",
          multiplier: "shipment"
        }
      ]
    }
  ],
  leadTimes: [
    {
      leadTimeHours: 72,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "HL2aF4",
        laneGroup: "",
        name: "Fondettes,FR",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "FR",
              from: "37230",
              to: ""
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 72,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "YpRZxu",
        laneGroup: "",
        name: "HALLUIN,FR",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "FR",
              from: "59520",
              to: ""
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 96,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "s3wgs4",
        laneGroup: "",
        name: "Porta Westfalica,DE",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "DE",
              from: "32457",
              to: ""
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 144,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "faXqBA",
        laneGroup: "",
        name: "THIENE-VICENZA,IT",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "IT",
              from: "36016",
              to: ""
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 96,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "xcv2HA",
        laneGroup: "",
        name: "Lisse/Capelle,NL",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "NL",
              from: "21",
              to: "29"
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 168,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "FMoPrs",
        laneGroup: "",
        name: "Almhut/Dio,SE",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "SE",
              from: "34",
              to: "35"
            }
          ]
        }
      }
    },
    {
      leadTimeHours: 144,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly",
      rules: {},
      lane: {
        id: "ZxioFr",
        laneGroup: "",
        name: "Bridgend,UK",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*",
              to: ""
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "CF35",
              to: "CF35"
            }
          ]
        }
      }
    }
  ],
  defaultLeadTime: {
    leadTimeHours: 168,
    days: [true, true, true, true, true, false, false],
    frequency: "weekly"
  },
  specialRequirements: [],
  terms: {
    days: 30,
    condition: "days"
  },
  updates: [
    {
      action: "created",
      userId: "W3WguXKt2cLu2h8LM",
      accountId: "S41452",
      ts: new Date("2019-07-02T15:52:04.693+02:00")
    },
    {
      action: "release",
      userId: "W3WguXKt2cLu2h8LM",
      accountId: "S41452",
      ts: new Date("2019-07-02T15:53:53.152+02:00")
    }
  ],
  created: {
    by: "W3WguXKt2cLu2h8LM",
    at: new Date("2019-07-02T15:52:04.660+02:00")
  },
  status: "active",
  carrierName: "DUMMY",
  summary: {
    laneCount: 7,
    rateCount: 147
  }
};
