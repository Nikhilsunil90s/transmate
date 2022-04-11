import round from "mongo-round";

import {
  shipmentCostGetExchangeDatePL,
  shipmentCostGetExchangeRatesPL,
  shipmentCostCalculateExchangeRatesPL,
  shipmentCostCalculateTotalsPL
} from "/imports/api/shipments/services/query.components";

// conversions:
// all items should be converted to the invoice main currency.
// 0. if currency == currency of invoice -> 1
// 1. if exchange rate -> use exchange rate
// 2 if no exchange rate -> get day rate
// it keeps the exchange rate in for the view to keep track of the org currency

export class InvoiceQueryBuilder {
  constructor() {
    this.pipeline = [];
  }

  queryInvoice(query) {
    this.pipeline = [...this.pipeline, { $match: query }];
    return this;
  }

  getPartnerData(partnerType) {
    // partnerType
    this.pipeline = this.pipeline.concat([
      {
        $lookup: {
          from: "accounts",
          let: { partnerId: `$${partnerType}Id` },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$partnerId"] } } },
            { $project: { name: 1, id: "$_id" } }
          ],
          as: `${partnerType}`
        }
      },
      {
        $unwind: { path: `$${partnerType}` }
      }
    ]);
    return this;
  }

  setCurrency() {
    this.pipeline = this.pipeline.concat([
      {
        $addFields: {
          invoiceCurrency: {
            $ifNull: ["$amount.currency", "EUR"]
          }
        }
      }
    ]);
    return this;
  }

  getItems() {
    this.pipeline = [
      ...this.pipeline,

      {
        $lookup: {
          from: "invoices.items",
          let: {
            invoiceId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$invoiceId", "$$invoiceId"]
                },
                deleted: false
              }
            },
            {
              $addFields: {
                costs: {
                  $map: {
                    input: "$costs",
                    as: "costItem",
                    in: {
                      $mergeObjects: [
                        "$$costItem",
                        {
                          type: "invoiced"
                        }
                      ]
                    }
                  }
                }
              }
            }
          ],
          as: "items"
        }
      }
    ];
    return this;
  }

  getItemCount() {
    this.pipeline = [
      ...this.pipeline,
      { $addFields: { itemCount: { $size: "$items" } } }
    ];
    return this;
  }

  getInvoiceItems() {
    // get invoice items
    this.getItems();
    this.getItemCount();
    this.pipeline = [
      ...this.pipeline,
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    return this;
  }

  getShipmentData(params = {}) {
    this.pipeline = this.pipeline.concat([
      {
        $lookup: {
          from: "shipments",
          let: {
            shipmentId: {
              $ifNull: ["$items.shipmentId", "empty"]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$shipmentId"]
                },
                deleted: false
              }
            },
            {
              $project: {
                costs: 1,
                costParams: 1,
                number: {
                  $ifNull: ["$references.number", "$number"]
                },
                createdAt: "$created.at",
                plannedPickup: "$pickup.date", // only if required
                ...(params.edi ? { edi: 1 } : undefined),
                ...(params.pickup ? { pickup: 1 } : undefined),
                ...(params.delivery ? { delivery: 1 } : undefined)
              }
            }
          ],
          as: "shipment"
        }
      },
      {
        $unwind: {
          path: "$shipment",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    return this;
  }

  setCalculatedLabelToShipmentCosts() {
    // report only
    this.pipeline = this.pipeline.concat([
      {
        $addFields: {
          "shipment.costs": {
            $map: {
              input: "$shipment.costs",
              as: "costItem",
              in: {
                $mergeObjects: ["$$costItem", { type: "calculated" }]
              }
            }
          }
        }
      }
    ]);
    return this;
  }

  getDatesFromStages() {
    // not used
    this.pipeline = this.pipeline.concat([
      {
        // this block is required if we need the dates for the exchange rates
        $lookup: {
          from: "stages",
          let: {
            shipmentId: "$items.shipmentId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$shipmentId", "$$shipmentId"]
                }
              }
            },
            {
              $project: {
                dates: "$dates.pickup"
              }
            }
          ],
          as: "stage"
        }
      }
    ]);
    return this;
  }

  // {$group:
  // 	_id:
  // 	date: $first: dates

  // }
  getExchangeDate() {
    this.pipeline = [
      ...this.pipeline,
      ...shipmentCostGetExchangeDatePL("invoice")
    ];
    return this;
  }

  getExchangeRate() {
    this.pipeline = [
      ...this.pipeline,
      ...shipmentCostGetExchangeRatesPL({
        shipmentCostField: "$shipment.costs",
        invoiceCostField: "$items.costs"
      })
    ];
    return this;
  }

  calculateExchange() {
    this.pipeline = [
      ...this.pipeline,
      ...shipmentCostCalculateExchangeRatesPL("invoice")
    ];
    return this;
  }

  calculateShipmentTotals() {
    this.pipeline = this.pipeline.concat([
      ...shipmentCostCalculateTotalsPL({
        projField: "shipment.totals",
        costField: "$shipment.costs"
      }),
      {
        $addFields: {
          "shipment.totals.fuelPct": {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: ["$shipment.totals.fuel", 0]
                  },
                  {
                    $ne: ["$shipment.totals.base", 0]
                  }
                ]
              },
              then: round(
                {
                  $divide: [
                    {
                      $ifNull: ["$shipment.totals.fuel", 1]
                    },
                    {
                      $ifNull: ["$shipment.totals.base", 1]
                    }
                  ]
                },
                4
              ),
              else: 0
            }
          }
        }
      }
    ]);
    return this;
  }

  calculateShipmentFlags() {
    this.pipeline = this.pipeline.concat([
      {
        $addFields: {
          "shipment.hasCosts": {
            $ne: [
              {
                $size: {
                  $ifNull: ["$shipment.costs", []]
                }
              },
              0
            ]
          }
        }
      },
      {
        $addFields: {
          "shipment.totals.exchangeDate": {
            $dateFromString: {
              dateString: "$shipExchDate" // TODO: can be on item level
            }
          }
        }
      }
    ]);
    return this;
  }

  removeShipmentDetails() {
    this.pipeline = this.pipeline.concat([
      {
        $project: {
          "shipment.costs": 0
        }
      }
    ]);
    return this;
  }

  calculateInvoiceTotals() {
    this.pipeline = this.pipeline.concat([
      {
        // calculate invoice cost totals
        // assumption: value is the value in the final currency????
        // todo: if exchange date is given, or we need to convert -> needs to be performed
        $addFields: {
          "items.totals": {
            $reduce: {
              input: "$items.costs",
              initialValue: {},
              in: {
                base: {
                  $cond: {
                    if: {
                      $eq: ["$$this.costId", "o6fLThAWhaWW3uDaj"]
                    },
                    then: {
                      $sum: [
                        {
                          $ifNull: ["$$value.base", 0]
                        },
                        "$$this.amount.value"
                      ]
                    },
                    else: {
                      $sum: [
                        {
                          $ifNull: ["$$value.base", 0]
                        },
                        0
                      ]
                    }
                  }
                },
                fuel: {
                  $cond: {
                    if: {
                      $eq: ["$$this.costId", "rFRy3NwqyhaWwqJuJ"]
                    },
                    then: {
                      $sum: [
                        {
                          $ifNull: ["$$value.fuel", 0]
                        },
                        "$$this.amount.value"
                      ]
                    },
                    else: {
                      $sum: [
                        {
                          $ifNull: ["$$value.fuel", 0]
                        },
                        0
                      ]
                    }
                  }
                },
                total: {
                  $sum: [
                    {
                      $ifNull: ["$$value.total", 0]
                    },
                    "$$this.amount.value"
                  ]
                },
                hasUnmappedCosts: {
                  $concatArrays: [
                    {
                      $ifNull: ["$$value.hasUnmappedCosts", []]
                    },
                    [
                      {
                        $eq: ["$$this.costId", "DummyCostID000000"]
                      }
                    ]
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          "items.totals.fuelPct": {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: ["$items.totals.fuel", 0]
                  },
                  {
                    $ne: ["$items.totals.base", 0]
                  }
                ]
              },
              then: round(
                {
                  $divide: [
                    {
                      $ifNull: ["$items.totals.fuel", 1]
                    },
                    {
                      $ifNull: ["$items.totals.base", 1]
                    }
                  ]
                },
                4
              ),
              else: 0
            }
          }
        }
      }
    ]);
    return this;
  }

  calculateInvoiceFlags() {
    this.pipeline = this.pipeline.concat([
      {
        $addFields: {
          "items.totals.hasUnmappedCosts": {
            $anyElementTrue: {
              $ifNull: ["$items.totals.hasUnmappedCosts", []]
            }
          }
        }
      },
      {
        $addFields: {
          "shipment.hasInvoiceCosts": {
            $ne: [
              {
                $size: {
                  $ifNull: ["$items.costs", []]
                }
              },
              0
            ]
          }
        }
      },
      {
        // to set a flag for exchange date correctness, we take the reference date for the exchange:
        // { $addFields: 'items.totals.test': '$items.costParams.currencyDate' }
        $addFields: {
          "items.totals.exchangeDate": {
            $let: {
              vars: {
                firstCostItem: {
                  $arrayElemAt: [
                    {
                      $ifNull: ["$items.costs", []]
                    },
                    0
                  ]
                },
                paramDate: "$items.costParams.currencyDate" // date can be set in document
              },
              in: {
                $ifNull: ["$$paramDate", "$$firstCostItem.amount.currencyDate"]
              }
            }
          }
        }
      },
      {
        $addFields: {
          "shipment.dateMatch": {
            $cond: {
              if: {
                $and: ["$shipment.hasInvoiceCosts", "$shipment.hasCosts"]
              },
              then: {
                $cond: {
                  if: {
                    $ne: ["$shipment.totals.orgCurrency", "$invoiceCurrency"]
                  },
                  then: {
                    match: {
                      $eq: [
                        "$shipment.totals.exchangeDate",
                        "$items.totals.exchangeDate"
                      ]
                    },
                    invExchDate: "$shipment.totals.exchangeDate",
                    shipExchDate: "$items.totals.exchangeDate"
                  },
                  else: {
                    match: true
                  }
                }
              },
              else: {
                match: true
              }
            }
          }
        }
      }
    ]);
    return this;
  }

  removeInvoiceDetails() {
    this.pipeline = this.pipeline.concat([
      {
        $project: {
          "items.costs": 0,
          invoiceId: 0,
          created: 0,
          updated: 0
        }
      }
    ]);
    return this;
  }

  calculateDelta() {
    this.pipeline = this.pipeline.concat([
      {
        $addFields: {
          delta: {
            $subtract: [
              {
                $ifNull: ["$items.totals.total", 0]
              },
              {
                $ifNull: ["$shipment.totals.total", 0]
              }
            ]
          }
        }
      },
      {
        $sort: {
          delta: -1
        }
      }
    ]);
    return this;
  }

  cleanView() {
    this.pipeline = this.pipeline.concat([
      {
        $group: {
          _id: {
            invoiceId: "$_id",
            seller: "$seller",
            client: "$client",
            accountId: "$accountId",
            number: "$number",
            importId: "$importId",
            status: {
              $ifNull: ["$status", "open"]
            },
            costs: "$costs", // overview of used cost types
            invoiceCurrency: "$invoiceCurrency",
            itemCount: "$itemCount",
            date: "$date",
            created: "$created",
            documents: "$documents"
          },
          shipments: {
            $push: {
              shipmentId: "$items.shipmentId",
              invoiceItemId: "$items._id",
              number: "$shipment.number",
              invoice: "$items.totals", // cost items of the invoice
              calculated: "$shipment.totals", // cost items of the shipment
              hasCosts: "$shipment.hasCosts",
              hasInvoiceCosts: "$shipment.hasInvoiceCosts",
              dateMatch: "$shipment.dateMatch",
              delta: "$delta",
              deltaFuelPct: {
                $subtract: [
                  "$items.totals.fuelPct",
                  "$shipments.totals.fuelPct"
                ]
              }
            }
          },
          totalDateMisMatch: {
            $sum: {
              $cond: ["$shipment.dateMatch.match", 0, 1]
            }
          },
          totalInvHasCost: {
            $sum: {
              $cond: ["$shipment.hasInvoiceCosts", 1, 0]
            }
          },
          totalShipHasCost: {
            $sum: {
              $cond: ["$shipment.hasCosts", 1, 0]
            }
          },
          totalShipmentBase: {
            $sum: "$shipment.totals.base"
          },
          totalShipmentFuel: {
            $sum: "$shipment.totals.fuel"
          },
          totalShipmentTotal: {
            $sum: "$shipment.totals.total"
          },
          totalinvoiceBase: {
            $sum: "$items.totals.base"
          },
          totalInvoiceFuel: {
            $sum: "$items.totals.fuel"
          },
          totalInvoiceTotal: {
            $sum: "$items.totals.total"
          },
          totalDelta: {
            $sum: "$delta"
          },
          largeDeltaCount: {
            $sum: {
              $cond: {
                if: {
                  $or: [
                    {
                      $gte: [
                        "$delta",
                        50 // threshold can be vairable
                      ]
                    },
                    {
                      $lte: ["$delta", -50]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          _id: "$_id.invoiceId",
          id: "$_id.invoiceId",
          seller: "$_id.seller",
          client: "$_id.client",
          accountId: "$_id.accountId",
          creatorId: "$_id.creatorId",
          number: "$_id.number",
          status: "$_id.status",
          costs: "$_id.costs",
          invoiceCurrency: "$_id.invoiceCurrency",
          itemCount: "$_id.itemCount",
          importId: "$_id.importId",

          documents: "$_id.documents",
          date: "$_id.date",
          created: "$_id.created",
          shipments: "$shipments",
          totals: {
            dateMismatch: "$totalDateMisMatch",
            invHasCostCount: "$totalInvHasCost",
            shipHasCostCount: "$totalShipHasCost",
            largeDeltaCount: "$largeDeltaCount",
            shipCount: "$count",
            shipment: {
              base: "$totalShipmentBase",
              fuel: "$totalShipmentFuel",
              total: "$totalShipmentTotal"
            },
            invoice: {
              base: "$totalinvoiceBase",
              fuel: "$totalInvoiceFuel",
              total: "$totalInvoiceTotal"
            },
            delta: "$totalDelta"
          }
        }
      }
    ]);
    return this;
  }

  cleanReport() {
    this.pipeline = this.pipeline.concat([
      {
        $project: {
          invoiceId: "$_id",
          shipmentId: "$shipment._id",
          costs: {
            $concatArrays: ["$items.costs", "$shipment.costs"]
          },
          status: 1,
          seller: "$carrier.name",
          "shipment.pickup": 1,
          "shipment.delivery": 1,
          "shipment.number": 1,
          excelLines: "$shipment.edi.excelLines"
        }
      },
      {
        $unwind: {
          path: "$costs",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    return this;
  }

  project({ fields = {} }) {
    this.pipeline = [...this.pipeline, { $project: fields }];
    return this;
  }

  get() {
    return this.pipeline;
  }
}
