import moment from "moment";

// requires fields:
// invoice pipeline:
// shipment.createdAt, shipment.plannedPickup, shipment.costParams, dates (project from stage)

// shipment pipeline:
// created, costParams, pickup, stages

export const shipmentCostGetExchangeDatePL = (type = "shipment") => {
  const isShipmPL = type === "shipment";
  return [
    {
      // get currency exchange rates
      // 1. either on shipment.costParams.currencyExchangeDate
      // 2. either on actual sail date (from stage)
      // 3. either on planned sail date (from stage)
      // 4. either on planned pickup date (from shipment)
      // 5. either on shipment creation date (from shipment)
      $addFields: {
        shipExchDate: {
          $let: {
            vars: {
              // invoice pipeline does projection, shipment pipeline not...
              createdAt: isShipmPL ? "$created.at" : "$shipment.createdAt",
              plannedPickup: isShipmPL
                ? "$pickup.plannedDate"
                : "$shipment.plannedPickup",
              costParams: isShipmPL ? "$costParams" : "$shipment.costParams",
              actualArrival: isShipmPL
                ? "$delivery.actualDate"
                : "$date.pickup.arrival.actual",
              plannedArrival: isShipmPL
                ? "$delivery.plannedDate"
                : "$date.pickup.arrival.planned"
            },
            in: {
              $let: {
                vars: {
                  currencyDate: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $gt: ["$$costParams.currencyDate", null]
                          },
                          then: "$$costParams.currencyDate"
                        },
                        {
                          case: {
                            $gt: ["$$actualArrival", null]
                          },
                          then: "$$actualArrival"
                        },
                        {
                          case: {
                            $gt: ["$$plannedArrival", null]
                          },
                          then: "$$plannedArrival" // blocks of stages in here....
                        },
                        {
                          case: {
                            $and: [
                              {
                                $gt: ["$$plannedPickup", null]
                              },
                              {
                                $lte: [
                                  "$$plannedPickup",
                                  moment.utc().endOf("day") // modify to end of day
                                ]
                              }
                            ]
                          },
                          then: "$$plannedPickup"
                        }
                      ],
                      default: "$$createdAt"
                    }
                  }
                },
                in: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$$currencyDate"
                  }
                }
              }
            }
          }
        }
      }
    }
  ];
};

export const shipmentCostGetExchangeRatesPL = ({
  shipmentCostField, // "$shipment.costs" || "$costs"
  invoiceCostField, // "$items.costs"
  currencies = []
}) => {
  return [
    {
      $addFields: {
        currencies: {
          $concatArrays: [
            ...(shipmentCostField
              ? [
                  {
                    $map: {
                      input: {
                        $ifNull: [shipmentCostField, []]
                      },
                      in: "$$this.amount.currency"
                    }
                  }
                ]
              : []),
            ...(invoiceCostField
              ? [
                  {
                    $map: {
                      input: {
                        $ifNull: [invoiceCostField, []]
                      },
                      in: "$$this.amount.currency"
                    }
                  }
                ]
              : []),
            currencies
          ]
        }
      }
    },
    {
      $lookup: {
        from: "rates",
        let: {
          calculationDate: "$shipExchDate",
          currencies: "$currencies"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$date", "$$calculationDate"]
              }
            }
          },
          {
            $project: {
              rates: {
                $filter: {
                  input: {
                    $objectToArray: "$rates"
                  },
                  as: "exchangeRate",
                  cond: {
                    $in: ["$$exchangeRate.k", "$$currencies"]
                  }
                }
              }
            }
          }
        ],
        as: "exchangeRate"
      }
    },
    {
      $unwind: {
        path: "$exchangeRate",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        hasExchangeRate: { $gt: ["$exchangeRate", -1] }
      }
    }
  ];
};

// in order to calculate the shipment costs, we look up the exchange and store in cost array
export const shipmentCostCalculateExchangeRatesPL = (
  type = "shipment",
  tgtCurrency
) => {
  const isShipmPL = type === "shipment";
  const targetCurrency = isShipmPL ? tgtCurrency : "$invoiceCurrency";
  const field = isShipmPL ? "costs" : "shipment.costs";
  return [
    {
      $addFields: {
        targetCurrency,
        [field]: {
          $map: {
            input: `$${field}`,
            as: "shipmentCost",
            in: {
              $mergeObjects: [
                "$$shipmentCost",
                {
                  calculatedExchange: {
                    $let: {
                      vars: {
                        targetExchange: {
                          $arrayElemAt: [
                            {
                              $ifNull: [
                                {
                                  $filter: {
                                    input: {
                                      $ifNull: ["$exchangeRate.rates", []]
                                    },
                                    cond: {
                                      $eq: ["$$this.k", targetCurrency]
                                    }
                                  }
                                },
                                []
                              ]
                            },
                            0
                          ]
                        },
                        sourceExchange: {
                          $arrayElemAt: [
                            {
                              $ifNull: [
                                {
                                  $filter: {
                                    input: "$exchangeRate.rates",
                                    cond: {
                                      $eq: [
                                        "$$this.k",
                                        "$$shipmentCost.amount.currency"
                                      ]
                                    }
                                  }
                                },
                                []
                              ]
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        $divide: [
                          {
                            $ifNull: ["$$targetExchange.v", 1]
                          },
                          {
                            $ifNull: ["$$sourceExchange.v", 1]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ];
};

// used in shipment aggregation & invoice pipeline
export const shipmentCostCalculateTotalsPL = ({ projField, costField }) => [
  {
    // calculate shipment cost totals
    $addFields: {
      [projField]: {
        $reduce: {
          input: costField,
          initialValue: {},
          in: {
            $let: {
              vars: {
                convertedValue: {
                  $multiply: [
                    "$$this.amount.value",
                    {
                      $ifNull: [
                        "$$this.amount.rate",
                        "$$this.calculatedExchange"
                      ]
                    }
                  ]
                },
                currency: "$$this.amount.currency"
              },
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
                        "$$convertedValue"
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
                        "$$convertedValue"
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
                additional: {
                  $cond: {
                    if: {
                      $ne: ["$$this.costId", "o6fLThAWhaWW3uDaj"]
                    },
                    then: {
                      $sum: [
                        {
                          $ifNull: ["$$value.additional", 0]
                        },
                        "$$convertedValue"
                      ]
                    },
                    else: {
                      $sum: [
                        {
                          $ifNull: ["$$value.additional", 0]
                        },
                        0
                      ]
                    }
                  }
                },
                manual: {
                  $sum: {
                    $cond: {
                      if: {
                        $eq: ["$$this.source", "input"]
                      },
                      then: {
                        $sum: [
                          {
                            $ifNull: ["$$value.base", 0]
                          },
                          "$$convertedValue"
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
                  }
                },
                total: {
                  $sum: [
                    {
                      $ifNull: ["$$value.total", 0]
                    },
                    "$$convertedValue"
                  ]
                },
                orgCurrency: {
                  $cond: {
                    if: {
                      $eq: [
                        {
                          $ifNull: ["$$value.orgCurrency", "$$currency"]
                        },
                        "$$currency"
                      ]
                    },
                    then: "$$currency",
                    else: "multi"
                  }
                },
                targetCurrency: "$targetCurrency"
              }
            }
          }
        }
      }
    }
  }
];
