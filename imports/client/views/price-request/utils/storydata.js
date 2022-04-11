import faker from "faker";
import businessDays from "../../../../api/_jsonSchemas/simple-schemas/_utilities/businessDays";

export const dummyProps = {
  priceRequest: {
    id: "test",
    currency: "EUR",
    dueDate: businessDays(),
    status: "requested",
    bidders: [
      {
        accountId: "C12639",
        name: "LKW WALTER Internationale Transportorganisation AG",
        contacts: [
          {
            contactType: "key account",
            firstName: "Stefan",
            lastName: "Gabler",
            mail: "gabler@lkw-walter.com",
            phone: "00 43 5 77772495",
            linkedId: "HhSfmuhj9XATab5w8",
            events: [
              {
                event: "send",
                timestamp: "2021-02-17T10:56:26.723Z"
              }
            ]
          },
          {
            firstName: "Gabriele",
            lastName: "Haas",
            mail: "gabriele.haas@lkw-walter.com",
            phone: "+43 577 772 173",
            linkedId: "TTRxvKM7dDBL4DGmp"
          }
        ],
        notified: new Date("2020-06-24T09:41:42.002+02:00"),
        userIds: ["HhSfmuhj9XATab5w8", "TTRxvKM7dDBL4DGmp"],
        firstSeen: new Date("2020-06-24T10:03:43.204+02:00"),
        lastSeen: new Date("2020-06-24T11:54:52.813+02:00"),
        viewed: true,
        bidOpened: new Date("2020-06-24T10:09:10.378+02:00"),
        priceListId: "MBcCwDtzouTkvfjoX",
        simpleBids: [
          {
            date: new Date("2020-06-24T12:09:47.771+02:00"),
            shipmentId: "LfPjec3hQBevaG3oT",
            chargeLines: [
              {
                id: "kvrTMnuzXcpMvACTg",
                name: "Base rate",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 875,
                  unit: "EUR"
                }
              }
            ]
          },
          {
            date: new Date("2020-06-24T12:09:47.771+02:00"),
            shipmentId: "LfPjec3hQBevaG3XX",
            won: true,
            chargeLines: [
              {
                id: "kvrTMnuzXcpMvACTg",
                name: "Base rate",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 400,
                  unit: "EUR"
                }
              }
            ]
          }
        ],
        bid: true,
        notes:
          "Angebot gilt für DE 86 + DE 80 => AT 1110 + AT 1010 Wien\n\nBitte um Info bis 13 h",
        lost: new Date("2020-06-24T12:52:14.961+02:00")
      },
      {
        accountId: "C04306",
        name: "Intra Speditionsgesm.b.H",
        contacts: [
          {
            contactType: "dispo",
            firstName: "Maja",
            lastName: "Petrovic",
            phone: "+43 160 291 381 5",
            mail: "m.petrovic@intrasped.at",
            linkedId: "NSiHShiFyAKzGMY6v"
          },
          {
            contactType: "director",
            firstName: "Marianne",
            lastName: "Kopitar",
            phone: "+43 160 291 381 5",
            mail: "m.kopitar@intrasped.at",
            linkedId: "KNdWE4p7MQcNrvNR7"
          },
          {
            firstName: "Ramon",
            mail: "r.kulovits@intrasped.at",
            lastName: "Kulovits",
            phone: "+43 160 291 381 4",
            linkedId: "R67ewuLYkaXboXdSs"
          }
        ],
        notified: new Date("2020-06-24T09:41:41.887+02:00"),
        userIds: [
          "KNdWE4p7MQcNrvNR7",
          "NSiHShiFyAKzGMY6v",
          "R67ewuLYkaXboXdSs"
        ],
        simpleBids: [
          {
            date: new Date("2020-06-24T12:09:47.771+02:00"),
            shipmentId: "LfPjec3hQBevaG3oT",
            won: true,
            chargeLines: [
              {
                id: "kvrTMnuzXcpMvACTg",
                name: "Base rate",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 875,
                  unit: "EUR"
                }
              }
            ]
          }
        ],
        lost: new Date("2020-06-24T12:52:14.545+02:00")
      }
    ],

    calculation: {
      items: [
        {
          shipmentId: "3Cv77RBHsqfvxpP9d",
          priceLists: [
            null,
            null,
            {
              accountId: "C59261",
              carrierName: "Zeit: Nah delivery solutions",
              priceListId: "Er3cBLd8CGBxbi4k4",
              title: "PR_0630-6LM_V1 by C59261 2020-06-30",
              totalCost: 1450,
              leadTime: 24,
              isFastest: true
            },
            {
              accountId: "C60790",
              carrierName: "Vienna Cargo GmbH",
              priceListId: "MfSCmNsEzeXgnihAS",
              title: "PR_0630-6LM_V1 by C60790 2020-06-30",
              totalCost: 1190,
              leadTime: 24,
              isCheapest: true
            },
            null
          ]
        },
        {
          shipmentId: "hnsTvJHd5MKYAgqet",
          priceLists: [
            {
              accountId: "C12639",
              carrierName: "LKW WALTER Internationale Transportorganisation AG",
              priceListId: "GQyTcSZguJ4NXqoLz",
              title: "PR_0630-6LM_V1 by C12639 2020-06-30",
              totalCost: 1350,
              leadTime: 24,
              isFastest: true
            },
            null,
            {
              accountId: "C59261",
              carrierName: "Zeit: Nah delivery solutions",
              priceListId: "Er3cBLd8CGBxbi4k4",
              title: "PR_0630-6LM_V1 by C59261 2020-06-30",
              totalCost: 1050,
              leadTime: 24
            },
            {
              accountId: "C60790",
              carrierName: "Vienna Cargo GmbH",
              priceListId: "MfSCmNsEzeXgnihAS",
              title: "PR_0630-6LM_V1 by C60790 2020-06-30",
              totalCost: 940,
              leadTime: 24,
              isCheapest: true
            },
            null
          ]
        }
      ],
      totals: [
        {
          accountId: "C12639",
          priceListId: "GQyTcSZguJ4NXqoLz",
          name: "LKW WALTER Internationale Transportorganisation AG",
          totalCost: 1350,
          leadTime: 24,
          validCount: 1,
          isIncomplete: true
        },
        {
          accountId: "C96874",
          priceListId: null,
          name: "Magellan Spedition GmbH",
          totalCost: 0,
          leadTime: 0,
          validCount: 0,
          isIncomplete: true
        },
        {
          accountId: "C59261",
          priceListId: "Er3cBLd8CGBxbi4k4",
          name: "Zeit: Nah delivery solutions",
          totalCost: 2500,
          leadTime: 48,
          validCount: 2,
          isFastest: true
        },
        {
          accountId: "C60790",
          priceListId: "MfSCmNsEzeXgnihAS",
          name: "Vienna Cargo GmbH",
          totalCost: 2130,
          leadTime: 48,
          validCount: 2,
          isCheapest: true
        },
        {
          accountId: "C65021",
          priceListId: null,
          name: "Trapp Spedition GmbH",
          totalCost: 0,
          leadTime: 0,
          validCount: 0,
          isIncomplete: true
        }
      ],
      chart: [
        {
          accountId: "C12639",
          color: "#483074",
          name: "LKW WALTER Internationale Transportorganisation AG",
          data: [[24, 1350]]
        },
        {
          accountId: "C96874",
          color: "#755da1",
          name: "Magellan Spedition GmbH",
          data: [[0, 0]]
        },
        {
          accountId: "C59261",
          color: "#a791d0",
          name: "Zeit: Nah delivery solutions",
          data: [[48, 2500]]
        },
        {
          accountId: "C60790",
          color: "#afabb6",
          name: "Vienna Cargo GmbH",
          data: [[48, 2130]]
        },
        {
          accountId: "C65021",
          color: "#3a3a3a",
          name: "Trapp Spedition GmbH",
          data: [[0, 0]]
        }
      ],
      summary: {
        bestCost: {
          leadTime: 48,
          priceListId: "MfSCmNsEzeXgnihAS",
          name: "Vienna Cargo GmbH",
          totalCost: 2130
        },
        bestLeadTime: {
          leadTime: 48,
          priceListId: "Er3cBLd8CGBxbi4k4",
          name: "Zeit: Nah delivery solutions",
          totalCost: 2500
        },
        totalRequested: 5,
        totalSubmitted: 5
      }
    },
    analyseData: [
      {
        type: "simulation",
        shipmentId: "3Cv77RBHsqfvxpP9d",
        shipmentType: "sea",
        carrierName: "carrier1",
        kg: 8000,
        km: 998.745,
        totalCostEur: 1627.7659022,
        kmCost: 1.629811315400828,
        kgCost: 0.203470737775
      },
      {
        type: "simulation",
        shipmentId: "hnsTvJHd5MKYAgqet",
        carrierName: "carrier2",
        shipmentType: "road",
        kg: 8000,
        km: 998.745,
        totalCostEur: 1627.7659022,
        kmCost: 1.629811315400828,
        kgCost: 0.203470737775
      },
      {
        shipmentId: "3Cv77RBHsqfvxpP9d",
        totalCostEur: 1450,
        carrierName: "carrier3",
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.18125,
        kmCost: 1.4518220366560033
      },
      {
        shipmentId: "3Cv77RBHsqfvxpP9d",
        totalCostEur: 1190,
        carrierName: "carrier2",
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.14875,
        kmCost: 1.1914953266349269
      },
      {
        shipmentId: "hnsTvJHd5MKYAgqet",
        carrierName: "carrier2",
        totalCostEur: 1350,
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.16875,
        kmCost: 1.3516963789555894
      },
      {
        shipmentId: "hnsTvJHd5MKYAgqet",
        carrierName: "carrier2",
        totalCostEur: 1050,
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.13125,
        kmCost: 1.0513194058543471
      },
      {
        shipmentId: "hnsTvJHd5MKYAgqet",
        carrierName: "carrier2",
        totalCostEur: 940,
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.1175,
        kmCost: 0.9411811823838918
      }
    ],

    items: [
      {
        shipmentId: "LfPjec3hQBevaG3oT",
        number: "Number 1",
        references: { number: "test 1" }
      },
      {
        shipmentId: "LfPjec3hQBevaG3XX",
        number: "Number 2 ",
        references: { number: "test 2" }
      }
    ],
    requirements: {
      customsClearance: true,
      freeDays: {
        condition: faker.lorem.sentence(),
        demurrage: 10,
        detention: 5
      }
    },
    settings: {
      templateId: "TEMPL:SPOT-SHIPM-SINGLE",
      templateSettings: {
        canEditCurrency: true,
        canEditMultiplier: false,
        canEditCharges: true,
        canEditLanes: false,
        canEditLeadTimes: true,
        canCommentRates: false
      }
    }
  },

  // result from separate fetch:
  items: [
    {
      id: "J3NjBA2xg5CKGbnvf",
      number: "FFI7VXAA",
      deliveryDate: 1593151200000,
      pickup: {
        location: {
          name: "Globex Brazil",
          countryCode: "BR",
          zipCode: "13467",
          addressId: "vX2WZcLowBhyP87Mf",
          locode: null,
          address: {
            street: "Rodovia Luiz de Queiroz",
            number: "1",
            city: "São Paulo",
            state: null,
            __typename: "AddressType"
          },
          annotation: {},
          timeZone: "America/Sao_Paulo",
          __typename: "FromToType"
        },
        date: 1593064800000,
        __typename: "PickupType"
      },
      pickupDate: 1593064800000,
      delivery: {
        location: {
          name: "Globex Spain",
          countryCode: "ES",
          zipCode: "28500",
          addressId: "WJNLceXYjFBdYL4YQ",
          locode: null,
          address: {
            street: "Avenida de Madrid",
            number: "43",
            city: "Arganda del Rey",
            state: "Comunidad de Madrid",
            __typename: "AddressType"
          },
          annotation: {
            id: "C11051",
            name: "Globex Spain"
          },
          timeZone: "Europe/Madrid",
          __typename: "FromToType"
        },
        date: 1593151200000,
        __typename: "DeliveryType"
      },
      shipper: {
        name: "Lacak.io",
        id: "S20529",
        annotation: {
          coding: null,
          __typename: "AccountAnnotation"
        },
        __typename: "AccountType"
      },
      references: null,
      nestedItems: [
        {
          id: "ieNmNDubqc4modjpe",
          level: 0,
          type: "TU",
          parentItemId: null,
          description: null,
          DG: null,
          DGClassType: null,
          quantity: {
            amount: 10,
            code: "40GE",
            description: null,
            __typename: "ShipmentItemQuantityType"
          },
          taxable: null,
          temperature: null,
          weight_gross: null,
          weight_net: null,
          weight_unit: null,
          __typename: "ShipmentItemType",
          subItems: []
        }
      ],
      __typename: "ShipmentAggr"
    },
    {
      id: "qcvtkRToy4hKcZzF8",
      number: "AXVDJCYW",
      deliveryDate: 1593151200000,
      pickup: {
        location: {
          name: "Globex Brazil",
          countryCode: "BR",
          zipCode: "13467",
          addressId: "vX2WZcLowBhyP87Mf",
          locode: null,
          address: {
            street: "Rodovia Luiz de Queiroz",
            number: "1",
            city: "São Paulo",
            state: null,
            __typename: "AddressType"
          },
          annotation: {},
          timeZone: "America/Sao_Paulo",
          __typename: "FromToType"
        },
        date: 1593064800000,
        __typename: "PickupType"
      },
      pickupDate: 1593064800000,
      delivery: {
        location: {
          name: "Globex Spain",
          countryCode: "ES",
          zipCode: "28500",
          addressId: "WJNLceXYjFBdYL4YQ",
          locode: null,
          address: {
            street: "Avenida de Madrid",
            number: "43",
            city: "Arganda del Rey",
            state: "Comunidad de Madrid",
            __typename: "AddressType"
          },
          annotation: {
            id: "C11051",
            name: "Globex Spain"
          },
          timeZone: "Europe/Madrid",
          __typename: "FromToType"
        },
        date: 1593151200000,
        __typename: "DeliveryType"
      },
      shipper: {
        name: "3D Futura",
        id: "S47529",
        annotation: {
          coding: null,
          __typename: "AccountAnnotation"
        },
        __typename: "AccountType"
      },
      references: null,
      nestedItems: [
        {
          id: "J8HD4ihLp8mHFmFDh",
          level: 0,
          type: "TU",
          parentItemId: null,
          description: null,
          DG: null,
          DGClassType: null,
          quantity: {
            amount: 100,
            code: "20GE",
            description: null,
            __typename: "ShipmentItemQuantityType"
          },
          taxable: null,
          temperature: null,
          weight_gross: null,
          weight_net: null,
          weight_unit: null,
          __typename: "ShipmentItemType"
        },
        {
          id: "2qChgKAP6PCYAu9a9",
          level: 0,
          type: "HU",
          parentItemId: "J8HD4ihLp8mHFmFDh",
          description: null,
          DG: null,
          DGClassType: null,
          quantity: {
            amount: 1,
            code: "PAL",
            description: null,
            __typename: "ShipmentItemQuantityType"
          },
          taxable: null,
          temperature: null,
          weight_gross: 100,
          weight_net: 100,
          weight_unit: "kg",
          __typename: "ShipmentItemType"
        }
      ],
      __typename: "ShipmentAggr"
    }
  ],

  // will depend on role in priceRequest
  // will  be projected if you are bidder:
  // current projection === bidder
  bidders: [
    {
      accountId: "C11051",
      name: "Carrier Beta",
      simpleBids: [
        {
          shipmentId: "J3NjBA2xg5CKGbnvf",
          date: 1597996557176,
          won: null,
          lost: null,
          chargeLines: [
            {
              id: "kvrTMnuzXcpMvACTg",
              name: "Base rate",
              costId: "o6fLThAWhaWW3uDaj",
              amount: {
                value: 1000,
                unit: "EUR",
                __typename: "ChargeAmountType"
              },
              comment: null,
              __typename: "ChargeLineType"
            }
          ],
          settings: {
            canEditCurrency: true,
            canEditMultiplier: false,
            canEditCharges: true,
            canEditLanes: false,
            canEditLeadTimes: true,
            canCommentRates: false,
            canEditAdditionalCosts: false
          },
          offered: null,
          __typename: "SimpleBidType"
        },
        {
          shipmentId: "qcvtkRToy4hKcZzF8",
          date: 1597996570672,
          won: null,
          lost: null,
          chargeLines: [
            {
              id: "kvrTMnuzXcpMvACTg",
              name: "Base rate",
              costId: "o6fLThAWhaWW3uDaj",
              amount: {
                value: 2000,
                unit: "EUR",
                __typename: "ChargeAmountType"
              },
              comment: null,
              __typename: "ChargeLineType"
            }
          ],
          settings: {
            canEditCurrency: true,
            canEditMultiplier: false,
            canEditCharges: true,
            canEditLanes: false,
            canEditLeadTimes: true,
            canCommentRates: false,
            canEditAdditionalCosts: false
          },
          offered: null,
          __typename: "SimpleBidType"
        }
      ],
      priceListId: "9vQyhiAwTixgLGufH",
      __typename: "PriceRequestBidderType"
    }
  ],

  // these are the mapped values, not the results of the call:
  priceListTemplates: [
    {
      key: "TEMPL:SPOT-SHIPM-SINGLE",
      text: "TEMPL:SPOT-SHIPM-SINGLE",
      value: "TEMPL:SPOT-SHIPM-SINGLE"
    },
    { key: "TEST-34", text: "Test 345", value: "TEST-34" }
  ],
  onSave: console.log,
  security: {
    isOwner: true,
    isBidder: false,
    canViewPartners: true,
    canViewAnalytics: true,
    canBeRequested: true,
    canBeSetBackToDraft: true,
    canBeArchived: true,
    canBeDeleted: true,
    canEditTitle: true,
    canEditMasterNote: true,
    canAddPartners: true,
    canEditRequirements: true,
    canViewRequirements: true,
    canBidOnRequest: false,
    canPlaceBid: false,
    canEditSettings: true,
    canViewSettings: true,
    canPostponeDeadline: true
  },
  refreshData: () => {}
};
