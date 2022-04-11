export const simulationDoc = {
  _id: "vNrXLe6YtGALQtHYb",
  analysisId: "HA9jM7Eqo4KWLDBne",
  name: "Short sea 45ft PT-> UK (Round 2)",
  created: {
    by: "W3WguXKt2cLu2h8LM",
    at: new Date("2019-06-18T16:08:24.699+02:00"),
    atms: 1560866904700
  },
  accountId: "S41452",
  params: {
    currency: "EUR",
    base: "pal",
    query: {
      carrierId: "all"
    }
  },
  status: "complete",
  scanning: false,
  scope: {
    lanes: [
      {
        name: "PT->GBBRG (CF35 5AQ)",
        id: "6cFkZ2",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "GB",
              from: "*"
            }
          ]
        }
      },
      {
        name: "PT->IE(KILTIMAGH)",
        id: "8LadJ2",
        from: {
          zones: [
            {
              CC: "PT",
              from: "*"
            }
          ]
        },
        to: {
          zones: [
            {
              CC: "IE",
              from: "*"
            }
          ]
        }
      }
    ],
    equipments: [
      {
        name: "45 FT container",
        types: ["45FT"],
        id: "HZvhiC"
      }
    ],
    definition: ["equipments"],
    source: {
      type: "input"
    }
  },
  steps: ["options", "data", "start", "report"],
  priceLists: [
    {
      id: "sHvBSWd92ZFNWfj3Y",
      title: "Invacare Short Sea PT -> GB+IE",
      carrierId: "C113453",
      carrierName: "Dachser Spain",
      alias: "Current"
    },
    {
      id: "ZNRjZ8z69R3YQXsHN",
      title: "Invacare Short Sea 45ft container PT->UK 2019",
      carrierId: "C76421",
      carrierName: "Kühne+Nagel,SA",
      alias: "KN Final"
    },
    {
      id: "dPeEmML5FARTRZJCp",
      title: "Invacare Short Sea 45ft container PT->UK - C08126",
      carrierId: "C08126",
      carrierName: "CEVA Logistics",
      alias: "CEVA Lo..."
    },
    {
      id: "WfH4MMqdc5zhyy4uj",
      title: "Invacare Short Sea 45ft container PT->UK - C76421",
      carrierId: "C76421",
      carrierName: "Kühne+Nagel,SA",
      alias: "Kühne+N..."
    },
    {
      id: "kJb4nxjueQJKpiknk",
      title: "Invacare Short Sea 45ft container PT->UK - C86348",
      carrierId: "C86348",
      carrierName: "DSV Road",
      alias: "DSV Roa..."
    },
    {
      id: "JCjrv6ptQdPEq4zdA",
      title: "Invacare Short Sea 45ft container PT->UK - C86375",
      carrierId: "C86375",
      carrierName: "Dachser",
      alias: "Dachser..."
    },
    {
      id: "ENCsEYrFNP2dp663Y",
      title: "Invacare Short Sea 45ft container PT->UK - C93222",
      carrierId: "C93222",
      carrierName: "RangelLogisticSolutions",
      alias: "RangelL..."
    },
    {
      id: "QR5pTb9eW2TvTPg6y",
      title: "Invacare Short Sea 45ft container PT->UK - C34892",
      carrierId: "C34892",
      carrierName: "KlogTransportSolutions",
      alias: "KlogTra..."
    }
  ],
  worker: "complete",
  aggregates: {
    topLevel: {
      priceLists: [
        {
          id: "WfH4MMqdc5zhyy4uj",
          totalCost: 339400,
          avgCost: 1749.48,
          avgUnitCost: 1749.48,
          avgLeadTime: 279,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "sHvBSWd92ZFNWfj3Y",
          totalCost: 324840,
          avgCost: 1674.43,
          avgUnitCost: 1674.43,
          avgLeadTime: 111,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "JCjrv6ptQdPEq4zdA",
          totalCost: 380838.26,
          avgCost: 1963.08,
          avgUnitCost: 1963.08,
          avgLeadTime: 183,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "QR5pTb9eW2TvTPg6y",
          totalCost: 324620,
          avgCost: 1673.3,
          avgUnitCost: 1673.3,
          avgLeadTime: 152,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "ENCsEYrFNP2dp663Y",
          totalCost: 352680,
          avgCost: 1817.94,
          avgUnitCost: 1817.94,
          avgLeadTime: 122,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "dPeEmML5FARTRZJCp",
          totalCost: 350080,
          avgCost: 1804.54,
          avgUnitCost: 1804.54,
          avgLeadTime: 283,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "kJb4nxjueQJKpiknk",
          totalCost: 446200,
          avgCost: 2300,
          avgUnitCost: 2300,
          avgLeadTime: 135,
          matches: 1,
          ambiguous: 0,
          errors: 0
        },
        {
          id: "ZNRjZ8z69R3YQXsHN",
          totalCost: 332680,
          avgCost: 1714.85,
          avgUnitCost: 1714.85,
          avgLeadTime: 279,
          matches: 1,
          ambiguous: 0,
          errors: 0
        }
      ],
      summary: {
        analysisId: "HA9jM7Eqo4KWLDBne",
        shipCount: 194,
        totalAmount: 194,
        currentCost: 332065,
        currentAvgLeadtime: 0
      }
    },
    byLanes: [
      {
        fromCC: "PT",
        lanes: [
          {
            quantity: {
              shipCount: 192,
              totalAmount: 192,
              currentCost: 328215,
              currentAvgLeadtime: 0
            },
            detail: {
              name: "PT->GBBRG (CF35 5AQ)"
            },
            priceLists: [
              {
                id: "ZNRjZ8z69R3YQXsHN",
                totalCost: 328320,
                avgCost: 1710,
                avgUnitCost: 1710,
                avgLeadTime: 294,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "sHvBSWd92ZFNWfj3Y",
                totalCost: 320640,
                avgCost: 1670,
                avgUnitCost: 1670,
                avgLeadTime: 126,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "kJb4nxjueQJKpiknk",
                totalCost: 441600,
                avgCost: 2300,
                avgUnitCost: 2300,
                avgLeadTime: 150,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "JCjrv6ptQdPEq4zdA",
                totalCost: 376473.12,
                avgCost: 1960.8,
                avgUnitCost: 1960.8,
                avgLeadTime: 198,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "WfH4MMqdc5zhyy4uj",
                totalCost: 335040,
                avgCost: 1745,
                avgUnitCost: 1745,
                avgLeadTime: 294,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "ENCsEYrFNP2dp663Y",
                totalCost: 348480,
                avgCost: 1815,
                avgUnitCost: 1815,
                avgLeadTime: 148,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "QR5pTb9eW2TvTPg6y",
                totalCost: 320640,
                avgCost: 1670,
                avgUnitCost: 1670,
                avgLeadTime: 160,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "dPeEmML5FARTRZJCp",
                totalCost: 345600,
                avgCost: 1800,
                avgUnitCost: 1800,
                avgLeadTime: 301,
                matches: 1,
                ambiguous: 0,
                errors: 0
              }
            ]
          },
          {
            quantity: {
              shipCount: 2,
              totalAmount: 2,
              currentCost: 3850,
              currentAvgLeadtime: 0
            },
            detail: {
              name: "PT->IE(KILTIMAGH)"
            },
            priceLists: [
              {
                id: "dPeEmML5FARTRZJCp",
                totalCost: 4480,
                avgCost: 2240,
                avgUnitCost: 2240,
                avgLeadTime: 264,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "QR5pTb9eW2TvTPg6y",
                totalCost: 3980,
                avgCost: 1990,
                avgUnitCost: 1990,
                avgLeadTime: 144,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "ENCsEYrFNP2dp663Y",
                totalCost: 4200,
                avgCost: 2100,
                avgUnitCost: 2100,
                avgLeadTime: 96,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "sHvBSWd92ZFNWfj3Y",
                totalCost: 4200,
                avgCost: 2100,
                avgUnitCost: 2100,
                avgLeadTime: 96,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "WfH4MMqdc5zhyy4uj",
                totalCost: 4360,
                avgCost: 2180,
                avgUnitCost: 2180,
                avgLeadTime: 264,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "ZNRjZ8z69R3YQXsHN",
                totalCost: 4360,
                avgCost: 2180,
                avgUnitCost: 2180,
                avgLeadTime: 264,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "JCjrv6ptQdPEq4zdA",
                totalCost: 4365.14,
                avgCost: 2182.57,
                avgUnitCost: 2182.57,
                avgLeadTime: 168,
                matches: 1,
                ambiguous: 0,
                errors: 0
              },
              {
                id: "kJb4nxjueQJKpiknk",
                totalCost: 4600,
                avgCost: 2300,
                avgUnitCost: 2300,
                avgLeadTime: 120,
                matches: 1,
                ambiguous: 0,
                errors: 0
              }
            ]
          }
        ]
      }
    ],
    summary: {
      summary: {
        analysisId: "HA9jM7Eqo4KWLDBne",
        shipCount: 194,
        totalAmount: 194,
        currentCost: 332065,
        currentAvgLeadtime: 0
      },
      priceList: {
        id: "WfH4MMqdc5zhyy4uj",
        totalCost: 339400,
        avgCost: 1749.48,
        avgUnitCost: 1749.48,
        avgLeadTime: 279,
        matches: 1,
        ambiguous: 0,
        errors: 0
      },
      saving: -7335,
      percent: -0.0220890488308012
    }
  }
};
