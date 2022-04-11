import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "../../../components/utilities/PageHolder";

import PriceRequestAnalytics from "./Analytics.jsx";

export default {
  title: "PriceRequest/Segments/Analytics"
};

const dummyProps = {
  priceRequest: {
    _id: "vQbKihXXgDjPuB6Lm",
    type: "spot",
    status: "requested",
    version: 2,
    currency: "EUR",
    settings: {
      templateId: "TEMPL:SPOT-SHIPM-SINGLE",
      templateSettings: {
        canEditCurrency: true,
        canEditMultiplier: false,
        canEditCharges: true,
        canEditLanes: false,
        canEditLeadTimes: true,
        canCommentRates: false,
        canEditAdditionalCosts: false
      }
    },
    creatorId: "S70325",
    requestedBy: "dH842ByGTEvhLmRxY",
    dueDate: "2020-07-08T08:35:00.000+0000",
    customerId: "S70325",
    updated: {
      by: "TYf5ksdWovbxcpiv7",
      at: "2020-07-01T11:02:24.023+0000"
    },
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: "2020-06-30T12:10:51.053+0000"
    },
    deleted: false,
    title: "GP HUN > Inbound > Röder/Orgatech",
    items: [
      {
        shipmentId: "3Cv77RBHsqfvxpP9d",
        params: {
          shipmentId: "3Cv77RBHsqfvxpP9d",
          from: {
            addressId: "vdApWfWD2ALYjbkdh",
            zipCode: "40474",
            countryCode: "DE"
          },
          to: {
            addressId: "KtagDFT7d52SeoYFm",
            zipCode: "2146",
            countryCode: "HU"
          },
          date: "2020-06-29",
          goods: {
            quantity: {
              pal: 33,
              kg: 8000,
              m3: 0,
              lm: 0,
              l: 0
            }
          },
          equipments: [
            {
              type: "TAUTLINER",
              quantity: 1
            }
          ]
        },
        number: "HXYWF5AC",
        validated: true,
        references: {
          number: "SHPT10"
        }
      },
      {
        shipmentId: "hnsTvJHd5MKYAgqet",
        params: {
          shipmentId: "hnsTvJHd5MKYAgqet",
          from: {
            addressId: "JRsRuAGjjGrp8jeg7",
            zipCode: "71277",
            countryCode: "DE"
          },
          to: {
            addressId: "KtagDFT7d52SeoYFm",
            zipCode: "2146",
            countryCode: "HU"
          },
          date: "2020-06-29",
          goods: {
            quantity: {
              pal: 33,
              kg: 8000,
              m3: 0,
              lm: 0,
              l: 0
            }
          },
          equipments: [
            {
              type: "TAUTLINER",
              quantity: 1
            }
          ]
        },
        number: "MMVKBC6Y",
        validated: true,
        references: {
          number: "SHPT11"
        }
      }
    ],
    bidders: [
      {
        accountId: "C12639",
        name2: "LKW WALTER Internationale Transportorganisation AG",
        contacts: [
          {
            contactType: "key account",
            firstName: "Stefan",
            lastName: "Gabler",
            mail: "gabler@lkw-walter.com",
            phone: "00 43 5 77772495",
            linkedId: "HhSfmuhj9XATab5w8"
          },
          {
            firstName: "Gabriele",
            lastName: "Haas",
            mail: "gabriele.haas@lkw-walter.com",
            phone: "+43 577 772 173",
            linkedId: "TTRxvKM7dDBL4DGmp"
          }
        ],
        userIds: [],
        firstSeen: "2020-06-30T12:18:30.685+0000",
        lastSeen: "2020-06-30T14:20:23.922+0000",
        priceListId: "GQyTcSZguJ4NXqoLz",
        notified: "2020-07-01T11:02:23.377+0000"
      },
      {
        accountId: "C96874",
        name: "Magellan Spedition GmbH",
        contacts: [
          {
            contactType: "director",
            firstName: "Kerstin",
            lastName: "Zellinger",
            mail: "zk@magellansped.com",
            phone: "00 43 7229 2171755",
            linkedId: "ShtwQ8gc7aXGduW6L"
          }
        ],
        userIds: [],
        notified: "2020-07-01T11:02:23.993+0000"
      },
      {
        accountId: "C59261",
        name: "Zeit: Nah delivery solutions",
        contacts: [
          {
            contactType: "director",
            firstName: "Karl",
            lastName: "Schöllbauer",
            mail: "office@zeit-nah.at",
            phone: "00 43 1 3763399",
            linkedId: "z78ZF7cPDLwtFWC5G"
          }
        ],
        userIds: [],
        firstSeen: "2020-06-30T12:24:28.727+0000",
        lastSeen: "2020-07-01T08:49:49.195+0000",
        priceListId: "Er3cBLd8CGBxbi4k4",
        notified: "2020-07-01T11:02:23.488+0000"
      },
      {
        accountId: "C60790",
        name: "Vienna Cargo GmbH",
        contacts: [
          {
            firstName: "Gabor",
            lastName: "Koosa",
            mail: "g.koosa@viennacargo.at",
            phone: "436602659139",
            linkedId: "n5wMpK9tfsHsXa7hJ"
          }
        ],
        userIds: [],
        firstSeen: "2020-06-30T12:30:30.329+0000",
        lastSeen: "2020-06-30T16:53:50.800+0000",
        priceListId: "MfSCmNsEzeXgnihAS",
        notified: "2020-07-01T11:02:23.635+0000"
      },
      {
        accountId: "C65021",
        name: "Trapp Spedition GmbH",
        contacts: [
          {
            contactType: "director",
            firstName: "Wolfgang",
            lastName: "Mirtl",
            mail: "mirtl@trappsped.at",
            phone: "00 43 664 2556410",
            linkedId: "m4B6pQ3RZcpD3xzAe"
          }
        ],
        userIds: [],
        notified: "2020-07-01T11:02:23.787+0000"
      }
    ],
    requirements: {},
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
        kg: 8000,
        km: 998.745,
        totalCostEur: 1627.7659022,
        kmCost: 1.629811315400828,
        kgCost: 0.203470737775
      },
      {
        type: "simulation",
        shipmentId: "hnsTvJHd5MKYAgqet",
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
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.14875,
        kmCost: 1.1914953266349269
      },
      {
        shipmentId: "hnsTvJHd5MKYAgqet",
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
        totalCostEur: 940,
        type: "bid",
        kg: 8000,
        km: 998.745,
        shipmentType: "road",
        kgCost: 0.1175,
        kmCost: 0.9411811823838918
      }
    ]
  },
  settings: {
    canEditCurrency: true,
    canEditMultiplier: false,
    canEditCharges: false,
    canEditLanes: false,
    canEditLeadTimes: false,
    canCommentRates: true
  }
};
export const withoutAnalyseData = () => {
  const data = JSON.parse(JSON.stringify(dummyProps));
  data.analyseData = null;
  return (
    <MockedProvider mocks={[]}>
      <PageHolder main="PriceRequest">
        <PriceRequestAnalytics {...data} />
      </PageHolder>
    </MockedProvider>
  );
};
export const withAnalyseData = () => {
  const data = JSON.parse(JSON.stringify(dummyProps));

  return (
    <MockedProvider mocks={[]}>
      <PageHolder main="PriceRequest">
        <PriceRequestAnalytics {...data} />
      </PageHolder>
    </MockedProvider>
  );
};
