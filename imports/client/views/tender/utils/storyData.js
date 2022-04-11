export const security = {
  isOwner: true,
  isBidder: false,
  userRole: "manager",
  canEditGeneral: true,
  canEditTenderFaq: true,
  canEditContacts: true,
  isOwnerOrManager: true,
  editContacts: true,
  canPlaceBid: false,
  canEditRequirement: true,
  canModifyTenderSettings: true,
  canGenerateProfile: true,
  canEditPartners: true
};

export const tender = {
  id: "x7krjFuftQP5zFW5J",
  title: "New tender - 2019-10-29",
  closeDate: "2018-05-09",
  notes: {
    introduction: `[{"children":[{"text":"title"}],"type":"heading-one"},{"children":[{"text":"some "},{"text":"procedure ","italic":true},{"text":"notes ","bold":true},{"text":"here","underline":true}]}]`,
    procedure: `[{"children":[{"text":"title"}],"type":"heading-one"},{"children":[{"text":"some "},{"text":"procedure ","italic":true},{"text":"notes ","bold":true},{"text":"here","underline":true}]}]`
  },
  status: "draft",
  bidders: [
    {
      accountId: "C12639",
      name: "Carrier 1",
      contacts: [
        {
          firstName: "first",
          lastName: "last",
          mail: "user@test.com",
          linkedId: "LW69k9YywiKLyQCFA",
          events: [
            {
              event: "send",
              timestamp: new Date("2020-09-24T15:58:44.128+02:00")
            },
            {
              event: "processed",
              timestamp: new Date("2020-09-24T15:58:44.000+02:00")
            },
            {
              event: "delivered",
              timestamp: new Date("2020-09-24T15:58:47.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-24T16:55:23.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-29T10:37:38.000+02:00")
            },
            {
              event: "send",
              timestamp: new Date("2020-09-29T11:16:34.937+02:00")
            },
            {
              event: "processed",
              timestamp: new Date("2020-09-29T11:16:35.000+02:00")
            },
            {
              event: "delivered",
              timestamp: new Date("2020-09-29T11:17:11.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:18:04.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:18:02.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:18:05.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:18:29.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:22:59.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:40:43.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-29T11:40:51.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-29T11:41:52.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-29T11:43:27.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-29T12:58:06.000+02:00")
            },
            {
              event: "click",
              timestamp: new Date("2020-09-30T12:10:23.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-30T14:58:59.000+02:00")
            },
            {
              event: "open",
              timestamp: new Date("2020-09-30T14:59:37.000+02:00")
            }
          ]
        }
      ],
      notified: new Date("2020-09-24T15:58:43.822+02:00"),
      viewed: true,
      bidOpened: new Date("2020-09-24T16:58:31.505+02:00"),
      bid: true,
      won: new Date("2020-09-29T11:16:34.972+02:00")
    },

    {
      accountId: "C59261",
      name: "Carrier 2",
      contacts: [
        {
          contactType: "director",
          firstName: "Jonas",
          lastName: "Schöllbauer",
          mail: "office@test.com",
          phone: "1256987987",
          linkedId: "z78ZF7cPDLwtFWCXX"
        }
      ],

      // stil used??
      userIds: ["LwtyL62DLgTctSDQR"],
      priceLists: [
        {
          id: "JCjrv6ptQdPEq4zdA",
          title: "Invacare Short Sea 45ft container PT->UK - C86375"
        }
      ],
      bids: ["iaFKqy", "njtCFn"],
      requirements: [
        {
          id: "ZuNASd",
          responseBool: true
        }
      ],
      documents: [
        {
          id: "RamZwR2zAqxn4ZrGr",
          name: "2019_Rate Card Short Sea 45ft. container PT_UK_revisão_2.xlsx"
        }
      ],
      NDAresponse: {
        accepted: true,
        doc: {
          name: "NDA-document.pdf",
          id: "psvqfYiQqMdeEigme"
        }
      },
      firstSeen: new Date("2020-09-24T16:55:29.959+02:00"),
      lastSeen: new Date("2020-09-30T13:49:15.413+02:00")
    }
  ],
  contacts: [
    {
      userId: "wZSbc5Azuy3uqi3aF",
      email: "test@test.com", // added in server call
      name: "Test user", // added in server call
      role: "owner"
    },
    {
      userId: "wZSbc5Azuy3uqi3FF",
      email: "test2@test.com", // added in server call
      name: "Test user 2", // added in server call
      role: "analyst"
    }
  ],
  uoms: {
    allowed: ["ctr"],
    conversions: [
      {
        from: {
          qty: 1,
          uom: "pal"
        },
        to: {
          qty: 1,
          uom: "pal"
        }
      }
    ]
  },
  created: {
    by: "wZSbc5Azuy3uqi3aF",
    at: new Date("2018-05-09T07:34:28.616+02:00")
  },
  accountId: "S35358",
  number: "YICCJP",
  requirements: [
    {
      title: "update lead times and pickup date(s)",
      details:
        "on each of the templates you can (per lane) define the lead times.\nMake sure to confirm those!",
      type: "hard",
      responseType: "YN",
      id: "ZuNASd"
    },
    {
      title: "confirm indexation",
      details:
        "if you apply indexation ,\r\n you need to send the indexation file for 2019 by email.",
      type: "hard",
      responseType: "YN",
      id: "95mz44"
    },
    {
      title: "testing list",
      details:
        "if you apply indexation ,\r\n you need to send the indexation file for 2019 by email.",
      type: "hard",
      responseType: "list",
      responseOptions: ["option 1", "option 2"],
      id: "95mzXX"
    },
    {
      title: "testing text",
      details: "free comments",
      type: "hard",
      responseType: "text",
      id: "95mzYY"
    }
  ],
  packages: [
    {
      pickupCountry: "BE",
      bidGroups: [
        {
          pickupCountry: "BE",
          pickupZip: "*",
          deliveryCountry: "ES",
          deliveryZip: "18000",
          shipmentIds: [],
          quantity: {
            scopeCount: 4,
            shipCount: 500,
            totalAmount: 4860,
            avgAmount: 1215,
            minAmount: 500,
            maxAmount: 2000,
            stdevAmount: 595.55,
            currentAvgLeadtime: null
          },
          id: "iaFKqy"
        },
        {
          pickupCountry: "BE",
          pickupZip: "*",
          deliveryCountry: "ES",
          deliveryZip: "28000",
          shipmentIds: [],
          quantity: {
            scopeCount: 4,
            shipCount: 400,
            totalAmount: 98691,
            avgAmount: 24672.75,
            minAmount: 5454,
            maxAmount: 65465,
            stdevAmount: 23834.36,
            currentAvgLeadtime: null
          },
          id: "njtCFn"
        }
      ]
    }
  ],
  timeline: [
    {
      title: "Q&A session by call",
      details:
        "Globex will organize a Q&A call to answer additional questions if needed",
      date: new Date("2018-09-10T02:00:00.000+02:00")
    },
    {
      title: "kick-off",
      date: new Date("2019-03-06T00:00:00.000+01:00")
    },
    {
      title: "round 1",
      details: "First pass tender",
      date: new Date("2019-04-26T00:00:00.000+02:00")
    },
    {
      title: "round 2",
      details: "second pass",
      date: new Date("2019-05-26T00:00:00.000+02:00")
    },
    {
      title: "final decision",
      date: new Date("2019-06-26T00:00:00.000+02:00")
    }
  ],
  FAQ: [
    {
      title: "What browser should we use",
      details:
        "the best user experience is with Chrome, Transmate should work with any recent browsers. Old internet explorer versions are not supported."
    },
    {
      title: "What templates should we quote in?",
      details:
        "the template you should use for the quote are linked to the tender. You can not use your own template. No additional costs are expected in this template."
    },
    {
      title: "Can we download the templates?",
      details:
        "Currently you can not download the templates. We will foresee this as an option in the future.\nCurrent templates are straight forward and should be easy to recreate in excel if needed."
    }
  ],
  params: {
    bid: {
      priceListId: "existingPriceListId",
      types: ["file", "open", "priceList"]
    },
    query: {
      carrierId: "all"
    }
  },
  deleted: false,
  updated: {
    by: "Dsqp3CRYjFpF8rQbh",
    at: new Date("2019-10-29T16:48:56.790+01:00"),
    tenders: "synced"
  },
  scope: {
    lanes: [
      {
        name: "Granada",
        from: {
          zones: [
            {
              CC: "BE",
              from: "*"
            }
          ]
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
        id: "LCHoEc"
      },
      {
        name: "Madrid",
        from: {
          zones: [
            {
              CC: "BE",
              from: "*"
            }
          ]
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
        id: "PMxLwW"
      }
    ],
    volumes: [
      {
        uom: "pal",
        serviceLevel: "LTL",
        ranges: [
          {
            from: 1,
            to: 5,
            id: "obsFDt",
            name: "1-5 pal"
          },
          {
            from: 5,
            to: 10,
            id: "uMMu4W",
            name: "5-10 pal"
          },
          {
            from: 10,
            to: 15,
            id: "QfyAyp",
            name: "10-15 pal"
          },
          {
            from: 15,
            to: 99,
            id: "2ypJrf",
            name: "15-99 pal"
          }
        ],
        id: "uZhkc4"
      }
    ],
    definition: ["volumes"],
    source: {
      type: "priceList"
    }
  },

  // projectedFields
  isOwner: true,
  isBidder: false
};
