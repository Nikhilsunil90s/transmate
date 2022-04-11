const DUMMY_PR_ID = "A643ZvFnzHKrXPpqQ";
const DUMMY_PL_ID = "bAdjF5yeTyLjmx8cn";

export const priceRequestTestData = ({
  creatorUserId,
  accountId = "S46614",
  carrierUserId,
  shipmentId1 = "DLDjx6mopXEMqTWSM",
  shipmentId2 = "fErvEb6hPCYYKrQTv",
  carrierId1,
  carrierId2
}) => ({
  priceRequestDoc: {
    _id: DUMMY_PR_ID,
    type: "spot",
    status: "requested",
    version: 1,
    currency: "EUR",
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
    },
    creatorId: accountId,
    requestedBy: creatorUserId,
    dueDate: new Date("2030-06-10T10:00:37.807+0000"),
    customerId: accountId,
    created: {
      by: creatorUserId,
      at: new Date("2020-06-09T20:43:38.004+0000")
    },
    deleted: false,
    title: "Price Request 0609-PQQ",
    items: [
      {
        shipmentId: shipmentId1,
        params: {
          from: {
            addressId: "Ygmudh6sby8hyZKSo",
            zipCode: "2000",
            countryCode: "BE"
          },
          to: {
            addressId: "6ncFFGmBLoEnAqK3E",
            zipCode: "42000",
            countryCode: "MY"
          },
          goods: {
            quantity: { kg: 13300 },
            temperature: true,
            tempConditions: "4-8c"
          },
          equipments: [{ type: "22G1", quantity: 1 }]
        }
      },
      {
        shipmentId: shipmentId2,
        params: {
          from: {
            addressId: "Ygmudh6sby8hyZKSo",
            zipCode: "2000",
            countryCode: "BE"
          },
          to: {
            addressId: "6ncFFGmBLoEnAqK3E",
            zipCode: "42000",
            countryCode: "MY"
          },
          goods: {
            quantity: { kg: 13300 },
            temperature: true,
            tempConditions: "4-8c"
          },
          equipments: [{ type: "22G1", quantity: 1 }]
        }
      }
    ],
    bidders: [
      {
        accountId: carrierId2,
        name: "Dummy",
        userIds: ["dummy"],
        simpleBids: []
      },
      {
        accountId: carrierId1,
        name: "24/7 design",
        notified: new Date("2020-06-09T20:43:51.649+0000"),
        userIds: [carrierUserId],
        firstSeen: new Date("2020-06-09T20:44:18.071+0000"),
        lastSeen: new Date("2020-06-09T20:44:18.187+0000"),
        viewed: true,
        bidOpened: new Date("2020-06-09T20:44:20.999+0000"),
        priceListId: DUMMY_PL_ID,
        bid: true,
        won: new Date("2020-06-09T20:45:27.837+0000"),
        simpleBids: []
      }
    ],
    calculation: {
      items: [
        {
          shipmentId: shipmentId1,
          priceLists: [
            {
              accountId: carrierId1,
              carrierName: "24/7 design",
              priceListId: DUMMY_PL_ID,
              title: "PR_0609-PQQ_V1 by C34359 2020-06-09",
              totalCost: 542,
              leadTime: 48,
              isCheapest: true,
              isFastest: true
            },
            null
          ]
        },
        {
          shipmentId: shipmentId2,
          priceLists: [
            {
              accountId: carrierId1,
              carrierName: "24/7 design",
              priceListId: DUMMY_PL_ID,
              title: "PR_0609-PQQ_V1 by C34359 2020-06-09",
              totalCost: 563,
              leadTime: 48,
              isCheapest: true,
              isFastest: true
            },
            null
          ]
        }
      ],
      totals: [
        {
          accountId: carrierId1,
          priceListId: DUMMY_PL_ID,
          name: "24/7 design",
          totalCost: 1105,
          leadTime: 96,
          validCount: 2,
          isCheapest: true,
          isFastest: true
        },
        {
          accountId: carrierId2,
          priceListId: null,
          name: "Globex US",
          totalCost: 0,
          leadTime: 0,
          validCount: 0,
          isIncomplete: true
        }
      ],
      chart: [
        {
          accountId: carrierId1,
          color: "#483074",
          name: "24/7 design",
          data: [[96, 1105]]
        },
        {
          accountId: carrierId2,
          color: "#755da1",
          name: "Globex US",
          data: [[0, 0]]
        }
      ],
      summary: {
        bestCost: {
          leadTime: 96,
          priceListId: DUMMY_PL_ID,
          name: "24/7 design",
          totalCost: 1105
        },
        bestLeadTime: {
          leadTime: 96,
          priceListId: DUMMY_PL_ID,
          name: "24/7 design",
          totalCost: 1105
        },
        totalRequested: 2,
        totalSubmitted: 2
      }
    }
  },
  priceListDoc: {
    _id: DUMMY_PL_ID,
    carrierId: carrierId1,
    carrierName: "DUMMY",
    template: { type: "spot" },
    type: "spot",
    mode: "road",
    validFrom: new Date(),
    validTo: new Date(),
    defaultLeadTime: {
      leadTimeHours: 24,
      days: [true, true, true, true, true, false, false],
      frequency: "weekly"
    },
    category: "standard",
    status: "for-approval",
    charges: [
      {
        name: "Base rate",
        costId: "o6fLThAWhaWW3uDaj",
        id: "kvrTMnuzXcpMvACTg",
        type: "calculated",
        currency: "EUR",
        multiplier: "shipment"
      }
    ],
    creatorId: accountId,
    currency: "EUR",
    priceRequestId: DUMMY_PR_ID,
    shipments: [{ shipmentId: shipmentId1 }, { shipmentId: shipmentId2 }],
    updates: [{ action: "created", userId: "", accountId, ts: new Date() }],
    created: { by: carrierUserId, at: new Date() }
  }
});
