import { Shipment } from "../Shipment";
import { getUserEntities } from "/imports/api/users/services/_roleFn";
import {
  shipmentCostGetExchangeDatePL,
  shipmentCostGetExchangeRatesPL,
  shipmentCostCalculateExchangeRatesPL,
  shipmentCostCalculateTotalsPL
} from "./query.components";

import { getAccountInfo } from "/imports/utils/functions/pipelineHelpers/plGetAccountInfo";

const debug = require("debug")("shipments:pipeline");

const DEFAULT_CURRENCY = "EUR";

const defaultFields = {
  _id: 1,
  id: "$_id",
  number: 1,
  accountId: 1,
  shipperId: 1,
  providerIds: 1,
  carrierIds: 1,
  type: 1,
  status: 1,
  references: 1,
  isTendered: { $gt: ["$priceRequestId", null] },
  pickup: 1,
  delivery: 1,
  costParams: 1, // for costs
  costs: 1, // for costs

  // TODO -> must be done differently!
  // totalCost: {
  //   $reduce: {
  //     input: { $ifNull: ["$costs", []] },
  //     initialValue: 0,
  //     in: { $sum: ["$$value", { $ifNull: ["$$this.amount.value", 0] }] }
  //   }
  // },
  // manualCost: {
  //   $reduce: {
  //     input: { $ifNull: ["$costs", []] },
  //     initialValue: 0,
  //     in: {
  //       $sum: [
  //         "$$value",
  //         {
  //           $cond: [
  //             { $eq: ["$$this.source", "input"] },
  //             { $ifNull: ["$$this.amount.value", 0] },
  //             0
  //           ]
  //         }
  //       ]
  //     }
  //   }
  // },
  pickupDate: "$pickup.date",
  deliveryDate: "$delivery.date",
  created: 1
};

// const minimalItemFields = {
//   description: 1,
//   weight_net: 1,
//   weight_tare: 1,
//   weight_gross: 1,
//   weight_unit: 1,
//   quantity: 1,
//   references: 1,
//   temperature: 1
// };

const defaultItemFields = {
  parentItemId: 1,
  level: 1,
  type: 1,
  description: 1,
  DG: 1,
  DGClassType: 1,
  quantity: 1,
  taxable: 1,
  references: 1,
  temperature: 1,
  weight_gross: 1,
  weight_net: 1,
  weight_unit: 1,
  commodity: 1,
  customs: 1,
  notes: 1
};

const DEFAULT_STAGE_FIELDS = {
  _id: 1
};

// const queryAccounts = accountId => ({
//   $or: [{ accountId }, { shipperId: accountId }, { carrierIds: accountId }]
// });

// used in shipment overview
export const shipmentAccountFilter = (
  accountId,
  entities = [],
  extraFilters = {}
) => ({
  $or: [
    {
      $and: [
        extraFilters,
        {
          // owner - no entity defined = null
          // owner - entity defined && should match:
          accountId,
          "costParams.entity": { $in: entities }
        }
      ]
    },
    {
      $and: [extraFilters, { "access.accountId": accountId }]
    },
    {
      $and: [
        extraFilters,
        {
          shipperId: accountId,
          accountId: { $ne: accountId }, // ! otherwise the entity check is bypassed
          status: {
            $nin: ["canceled"]
          }
        }
      ]
    },
    {
      $and: [
        extraFilters,
        {
          consigneeId: accountId,
          status: {
            $nin: ["draft", "canceled"]
          }
        }
      ]
    },
    {
      $and: [
        extraFilters,
        {
          carrierIds: accountId,
          status: {
            $nin: ["draft", "canceled"]
          }
        }
      ]
    },
    {
      $and: [
        extraFilters,
        {
          providerIds: accountId,
          status: {
            $nin: ["draft", "canceled"]
          }
        }
      ]
    }
  ]
});

export const shipmentAggregation = ({ userId, accountId }) => ({
  userId,
  accountId,
  pipeline: [],
  userEntities: [null],

  /** allows filtering on entity level */
  async getUserEntities() {
    this.userEntities = await getUserEntities(this.userId, this.accountId);
    return this;
  },

  /** increases performance in pipeline when only requiring 1 shipment */
  matchId({ shipmentId = "" }) {
    debug("shipmentAggregation:matchId: %s", shipmentId);
    this.pipeline = [{ $match: { _id: shipmentId } }, ...this.pipeline];
    debug("shipmentAggregation:matchId pipeline %j", this.pipeline);
    return this;
  },

  /** @param {{query?: any[],options?: any, fieldsProjection?: any}} param0 */
  match({ query = [], options = {}, fieldsProjection = defaultFields }) {
    debug("shipmentAggregation:match query %j", query);
    this.fieldsProjection = fieldsProjection;
    this.pipeline = [
      ...this.pipeline,
      {
        $match: {
          $and: [
            {
              deleted: false,
              ...(!options.noStatusFilter
                ? { status: { $ne: "canceled" } }
                : {})
            },

            // account filter basic (not taking into account shipment status)
            ...(!options.noAccountFilter
              ? [shipmentAccountFilter(this.accountId, this.userEntities)]
              : []),
            ...query
          ]
        }
      },
      { $project: { id: "$_id", _id: 1, ...fieldsProjection } }
    ];
    debug(
      "shipmentAggregation:match pipeline db.shipments.aggregate(%j)",
      this.pipeline
    );
    return this;
  },
  getAccountData({ partner, fields = {} }) {
    // will take accountId of the shipment root
    const fieldM = {
      carrier: { $ifNull: [{ $arrayElemAt: ["$carrierIds", 0] }, "none"] },
      shipper: { $ifNull: ["$shipperId", "none"] },
      consignee: { $ifNull: ["$consigneeId", "none"] },
      providers: "$providerIds", // unwind first!!
      account: "$accountId",
      sCarrier: "$stages.carrierId" // stages need to be unwound
    };

    this.pipeline = [
      ...this.pipeline,
      ...getAccountInfo({
        partnerIdField: fieldM[partner],
        asField: partner,
        fields
      })
    ];

    return this;
  },
  getAddressAnnotation({ stop, path, fields = {} }) {
    // takes annotation of the root accountId
    const root = path || `${stop}.location`; // stop ==pickup || delivery in shipment

    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "addresses",
          let: {
            addressId: `$${root}.addressId`,
            accountId: "$accountId"
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$addressId"] } } },
            {
              $project: {
                name: 1,
                annotation: {
                  $arrayElemAt: [
                    {
                      $ifNull: [
                        {
                          $filter: {
                            input: "$accounts",
                            as: "annotations",
                            cond: {
                              $eq: ["$$annotations.id", "$$accountId"]
                            }
                          }
                        },
                        []
                      ]
                    },
                    0
                  ]
                },
                ...fields
              }
            }
          ],
          as: "temp"
        }
      },
      {
        // need to merge objects:
        $addFields: {
          [`${root}`]: {
            $let: {
              vars: {
                temp: { $arrayElemAt: [{ $ifNull: ["$temp", []] }, 0] }
              },
              in: { $mergeObjects: [`$${root}`, "$$temp"] }
            }
          }
        }
      }
    ];
    return this;
  },

  // use field resolver links
  getLinks() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "shipment.project",
          let: { projectId: "$shipmentProjectInboundId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$projectId"] } } },
            {
              $project: {
                id: "$_id",
                title: 1,
                type: 1,
                status: 1
              }
            }
          ],
          as: "linkInbound"
        }
      },
      {
        $lookup: {
          from: "shipment.project",
          let: { projectId: "$shipmentProjectOutboundId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$projectId"] } } },
            {
              $project: {
                id: "$_id",
                title: 1,
                type: 1,
                status: 1
              }
            }
          ],
          as: "linkOutbound"
        }
      },
      {
        $lookup: {
          from: "price.request",
          let: { priceRequestId: "$priceRequestId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$priceRequestId"] } } },
            {
              $project: {
                id: "$_id",
                title: 1,
                status: 1
              }
            }
          ],
          as: "linkPriceRequest"
        }
      }
    ];
    return this;
  },

  /** gets stages for shipment, has option to filter specific stage.
   * @param {Object} fields default projection {_id:1}
   * @param {Object} filters
   * @param {String} filters.stageId
   */
  getStages({ filters = {}, fields = DEFAULT_STAGE_FIELDS }) {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "stages",
          let: { shipmentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$shipmentId", "$$shipmentId"] },
                    ...(filters.stageId
                      ? [{ $eq: ["$_id", filters.stageId] }]
                      : [])
                  ]
                }
              }
            },
            {
              $project: {
                id: "$_id",
                ...fields
              }
            }
          ],
          as: "stages"
        }
      },
      { $addFields: { stageCount: { $size: "$stages" } } }
    ];
    return this;
  },
  getFirstStage() {
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          lastStage: {
            $arrayElemAt: ["$stages", 0]
          }
        }
      }
    ];
    return this;
  },
  getLastStage() {
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          lastStage: {
            $arrayElemAt: ["$stages", -1]
          }
        }
      }
    ];
    return this;
  },
  projectStageDates() {
    // adds the planned and actual dates to the shipment form/to
    // datePlanned: Date # = [first|last]Stage.dates.[pickup|delivery].arrival.planned
    // dateActual: Date # = [first|last]Stage.dates.[pickup|delivery].arrival.actual
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          "pickup.datePlanned": "$firstStage.dates.pickup.arrival.planned",
          "pickup.dateActual": "$firstStage.dates.pickup.arrival.actual",
          "delivery.datePlanned": "$lastStage.dates.delivery.arrival.planned",
          "delivery.dateActual": "$lastStage.dates.delivery.arrival.actual"
        }
      }
    ];
    return this;
  },
  getItems({ fields, depth, types = ["HU", "TU"] }) {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "shipment.items",
          let: { shipmentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$shipmentId", "$$shipmentId"] },
                    ...(depth > -1 ? [{ $lte: ["$level", depth] }] : []),
                    ...(types.length ? [{ $in: ["$type", types] }] : [])
                  ]
                }
              }
            },
            {
              $project: {
                id: "$_id",
                ...(fields || defaultItemFields)
              }
            }
          ],
          as: "nestedItems"
        }
      }
    ];
    return this;
  },
  getFirstItem({ fields = {} }) {
    this.getItems({ fields });
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          firstItem: { $arrayElemAt: [{ $ifNull: ["$nestedItems", []] }, 0] }
        }
      },
      { $project: { nestedItems: 0 } }
    ];
    return this;
  },
  getDocuments() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "documents",
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $addFields: { id: "$_id" } }
          ],
          as: "documents"
        }
      }
    ];
    return this;
  },
  getNonConformances() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "shipment.nonconformances",
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $addFields: { id: "$_id" } }
          ],
          as: "nonConformances"
        }
      }
    ];
    return this;
  },

  /**
   * maps the costs array and adds an exchange rate to it.
   * sets target currency to the root
   */
  getCostExchangeRates({ currency = DEFAULT_CURRENCY }) {
    this.pipeline = [
      ...this.pipeline,
      ...shipmentCostGetExchangeDatePL("shipment"),
      ...shipmentCostGetExchangeRatesPL({
        shipmentCostField: "$costs",
        currencies: [currency]
      }),
      ...shipmentCostCalculateExchangeRatesPL("shipment", currency)
    ];
    return this;
  },

  /** creates a totals field */
  calculateTotalCosts() {
    this.pipeline = [
      ...this.pipeline,
      ...shipmentCostCalculateTotalsPL({
        projField: "totals",
        costField: "$costs"
      })
    ];
    return this;
  },

  // gets cost description if it is empty:
  getCostDescriptions() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "costs",
          let: {
            costIds: {
              $map: {
                input: { $ifNull: ["$costs", []] },
                in: "$$this.costId"
              }
            }
          },
          pipeline: [{ $match: { $expr: { $in: ["$_id", "$$costIds"] } } }],
          as: "costRefs"
        }
      },
      {
        $addFields: {
          costs: {
            $map: {
              input: { $ifNull: ["$costs", []] },
              as: "cost",
              in: {
                $mergeObjects: [
                  "$$cost",
                  {
                    description: {
                      $cond: [
                        { $gt: ["$$cost.description", null] },
                        "$$cost.description",
                        {
                          $let: {
                            vars: {
                              ref: {
                                $arrayElemAt: [
                                  {
                                    $ifNull: [
                                      {
                                        $filter: {
                                          input: { $ifNull: ["$costRefs", []] },
                                          cond: {
                                            $eq: ["$$this._id", "$$cost.costId"]
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
                            in: "$$ref.cost"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];
    return this;
  },

  // optional filter on invoiceId
  getInvoiceHeaders({ invoiceId }) {
    if (!invoiceId) return this;
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "invoices.items",
          let: { shipmentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$shipmentId", "$$shipmentId"] },
                    ...(invoiceId ? [{ $eq: ["$invoiceId", invoiceId] }] : [])
                  ]
                }
              }
            }
          ],
          as: "invoiceItems"
        }
      },
      {
        $lookup: {
          from: "invoices",
          let: {
            invoiceIds: {
              $map: {
                input: { $ifNull: ["$invoiceItems", []] },
                in: "$$this.invoiceId"
              }
            }
          },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$invoiceIds"] } } },
            { $project: { costs: 0 } }
          ],
          as: "invoices"
        }
      },

      // sets the costs of the item under the invoice
      {
        $addFields: {
          invoices: {
            $map: {
              input: { $ifNull: ["$invoices", []] },
              as: "invoice",
              in: {
                $let: {
                  vars: {
                    invoiceItem: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$invoiceItems",
                            as: "item",
                            cond: { $eq: ["$$item.invoiceId", "$$invoice._id"] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    $mergeObjects: [
                      "$$invoice",
                      { items: "$$invoiceItem.costs" }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      { $project: { invoiceItems: 0 } }
    ];
    return this;
  },
  getSettingsData(topic) {
    const dMap = {
      entity: {
        localF: "$costParams.entity",
        settingsKey: "$entities",
        arrayKey: "code"
      }
    };
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "accounts",
          let: { localField: dMap[topic].localF },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", this.accountId] } } },
            {
              $project: {
                data: {
                  $arrayElemAt: [
                    {
                      $ifNull: [
                        {
                          $filter: {
                            input: dMap[topic].settingsKey,
                            as: "arr",
                            cond: {
                              $eq: [
                                `$$arr.${dMap[topic].arrayKey}`,
                                "$$localField"
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
              }
            }
          ],
          as: "temp"
        }
      },
      {
        $addFields: {
          [topic]: {
            $let: {
              vars: {
                settings: { $arrayElemAt: [{ $ifNull: ["$temp", []] }, 0] }
              },
              in: "$$settings.data"
            }
          }
        }
      }
    ];
    return this;
  },
  getPlanners() {
    this.pipeline = [
      ...this.pipeline,

      // creator:
      {
        $lookup: {
          from: "users",
          let: { userId: "$created.by" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                id: "$_id",
                email: { $arrayElemAt: ["$emails.address", 0] },
                first: "$profile.first",
                last: "$profile.last",
                name: "$profile.name",
                role: "creator"
              }
            }
          ],
          as: "temp"
        }
      },
      {
        $addFields: {
          planners: [{ $arrayElemAt: [{ $ifNull: ["$temp", []] }, 0] }]
        }
      }
    ];
    return this;
  },
  sort(sort) {
    this.pipeline = [...this.pipeline, { $sort: sort }];
    return this;
  },
  add(stages = []) {
    this.pipeline = [...this.pipeline, ...stages];
    return this;
  },
  fetch(showDebug) {
    if (showDebug) {
      debug(
        "debug fetch pipeline db.getCollection('shipments').aggregate( %j )",
        this.pipeline
      );
    }
    return Shipment.aggregateWithBuffer(this.pipeline);
  },
  fetchDirect(showDebug) {
    if (showDebug) {
      debug(
        "debug fetchDirect pipeline db.getCollection('shipments').aggregate( %j )",
        this.pipeline
      );
      console.info(JSON.stringify(this.pipeline));
    }
    return Shipment.aggregate(this.pipeline);
  }
});
