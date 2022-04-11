/* eslint-disable no-use-before-define */
/* eslint-disable default-case */
import moment from "moment";
import startsWith from "underscore.string/startsWith";
import get from "lodash.get";
import dot from "dot-object";

import { FLAGS } from "/imports/api/_jsonSchemas/enums/shipment.js";
import { Shipment } from "../../shipments/Shipment";
import { getUserEntities } from "/imports/api/users/services/_roleFn";
import { shipmentAccountFilter } from "/imports/api/shipments/services/query.pipelineBuilder";

const debug = require("debug")("shipmentOverview:aggregation");

// shipment overview with mongo! on limited data set (only shipments of 2 months)
/**
 * @name shipmentOverViewAggregation
 * @param {{userId: String, accountId: String, view: Object, sort: object, start: Number, length: Number}}
 * @returns {this}
 *
 * @see {@link /imports/client/views/shipments/table.md}
 * */
export const shipmentOverViewAggregation = ({
  userId,
  accountId,
  view,
  sort,
  start,
  length
}) => ({
  userId,
  accountId,
  view,
  columns: view.columns || [],
  filtersArr: Object.entries(view.filters || {}).map(([field, filter]) => ({
    field, // = key
    filter // object with filter info
  })),
  start,
  length,
  pipeline: [],
  searchStrategy: {},
  result: {
    data: [],
    recordsTotal: 0,
    recordsFiltered: 0,
    jobId: new Date()
  },
  async prepareSearch() {
    debug("prepare search called");

    // userEntities & role info:
    this.userEntities = await getUserEntities(this.userId, this.accountId);

    // shipment:
    this.shipmentFilters = {
      ...defaultStatusFilter(),
      ...statusFilter(this.view),
      ...entityFilter(this.view),
      ...plannerMeFilter(this.view, this.userId),
      ...hasPriceRequestFilter(this.view),
      ...hasProjectFilter(this.view),
      ...locationFilter(this.filtersArr),
      ...shipperFilter(this.view),
      ...consigneeFilter(this.view),
      ...carrierFilter(this.view),
      ...shipmentFlags(this.view),
      ...shipmentProjectInboundFilter(this.view),
      ...shipmentProjectOutboundFilter(this.view)
    };
    this.shipmentProjections = {
      flags: 1,
      type: 1, // mode
      status: 1,
      accountId: 1,
      carrierIds: 1,
      ...shipmentDates(),
      ...locationFields(this.view, this.columns, "pickup"),
      ...locationFields(this.view, this.columns, "delivery"),
      ...hasPriceRequest(this.columns),
      ...plannerMe(this.columns, this.userId),
      ...hasProject(this.columns),
      ...shipperId(this.columns),
      ...consigneeId(this.columns),
      ...shipmentCosts(this.view),
      ...shipmentRefs(this.columns),
      ...projectRefs(this.columns),
      ...projectEntities(this.columns),
      ...shipmentProjectOutboundFilter(this.columns)
    };

    // stage:
    this.getStageDocs = this.columns.some(
      column => column === "shipment.drivers"
    );

    // items:
    this.shouldGetItemDocs = this.columns.some(column =>
      startsWith(column, "item.")
    );

    // invoice
    this.getInvoiceChecks = {
      hasInvoiceColumns: this.columns.some(column =>
        startsWith(column, "invoices.")
      ),
      deltaColumn: this.columns.some(column => column === "costs.delta"),
      hasDeltaFilter: this.filtersArr.some(({ field }) => field === "delta")
    };
    this.getInvoiceDocs = Object.values(this.getInvoiceChecks).some(x => x);

    // projects:
    this.shouldGetProjectInfo = this.columns.includes("projects.title");

    // entities:
    this.shouldGetEntityInfo = this.columns.some(c => c.match(/^entities/));
    return this;
  },
  getshipmentDoc() {
    // shipmentFilters:
    debug("getshipmentDoc search called");
    debug(".this.shipmentFilters ", this.shipmentFilters);
    this.pipeline = [
      ...this.pipeline,
      {
        $match: {
          // account filters
          ...shipmentAccountFilter(this.accountId, this.userEntities, {
            ...this.shipmentFilters,
            ...applyDateLimit(),
            deleted: false
          })
        }
      },

      {
        $project: {
          number: 1,
          access: {
            $filter: {
              input: "$access",
              as: "el",
              cond: { $eq: ["$$el.accountId", accountId] }
            }
          },
          ...this.shipmentProjections
        }
      }
    ];
    return this;
  },

  getPartnerInfo() {
    // carrierSearch first as this is performing not so good
    [
      ["partners.carriers", "$carrierIds", "$in", "carriers"],
      ["partners.shipper", "$shipperId", "$eq", "shipper"],
      ["partners.consignee", "$consigneeId", "$eq", "consignee"]
    ].forEach(([col, field, expr, projected]) => {
      if (this.columns.includes(col)) {
        this.pipeline = [
          ...this.pipeline,
          {
            $lookup: {
              from: "accounts",
              let: {
                // we cast an empty string or array to avoid searching with null value
                partnerId: { $ifNull: [field, expr === "$eq" ? "EMPTY" : []] }
              },
              pipeline: [
                { $match: { $expr: { [expr]: ["$_id", "$$partnerId"] } } },
                { $limit: 1 },
                ...getAccountFields(this.acountId)
              ],
              as: projected
            }
          },
          {
            $unwind: {
              path: `$${projected}`,
              preserveNullAndEmptyArrays: true
            }
          }
        ];
      }
    });
    return this;
  },
  getProjectInfo() {
    if (this.shouldGetProjectInfo) {
      this.pipeline = [
        ...this.pipeline,
        {
          $lookup: {
            from: "shipment.project",
            let: {
              inId: "$shipmentProjectInboundId",
              outId: "$shipmentProjectOutboundId"
            },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", ["$$inId", "$$outId"]] } } },
              {
                $group: {
                  _id: null,
                  label: {
                    $push: {
                      $cond: [
                        { $eq: ["$_id", "$$inId"] },
                        { $concat: ["IN: ", "$title"] },
                        {
                          $cond: [
                            { $eq: ["$_id", "$$inId"] },
                            { $concat: ["OUT: ", "$title"] },
                            ""
                          ]
                        }
                      ]
                    }
                  }
                }
              },
              {
                $project: {
                  title: {
                    $reduce: {
                      input: "$label",
                      initialValue: "",
                      in: { $concat: ["$$value", " ", "$$this"] }
                    }
                  }
                }
              }
            ],
            as: "projects"
          }
        },
        { $unwind: { path: "$projects", preserveNullAndEmptyArrays: true } }
      ];
    }
    return this;
  },
  getEntityInfo() {
    if (this.shouldGetEntityInfo) {
      this.pipeline = [
        ...this.pipeline,
        {
          $lookup: {
            from: "accounts",
            let: {
              accountId: this.accountId,
              code: "$costParams.entity"
            },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$accountId"] } } },
              {
                $project: {
                  entities: {
                    $filter: {
                      input: { $ifNull: ["$entities", []] },
                      cond: { $eq: ["$$this.code", "$$code"] }
                    }
                  }
                }
              }
            ],
            as: "entityInfo"
          }
        },
        { $unwind: { path: "$entityInfo", preserveNullAndEmptyArrays: true } }
      ];
    }
    return this;
  },
  getStageInfo() {
    if (this.getStageDocs) {
      this.pipeline = [
        ...this.pipeline,
        {
          $lookup: {
            from: "stages",
            localField: "_id",
            foreignField: "shipmentId",
            as: "stages"
          }
        }
      ];

      const driverFilter = driverAllocationFilter(this.view);
      if (driverFilter) {
        this.pipeline.push({ $match: driverFilter });
      }
    }

    return this;
  },
  getItemDocs() {
    if (this.shouldGetItemDocs) {
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
                      { $eq: ["$level", 0] }
                    ]
                  }
                }
              },
              { $limit: 1 },
              { $project: { id: "$_id", references: 1 } }
            ],
            as: "items"
          }
        },
        {
          $unwind: {
            path: "$items",
            preserveNullAndEmptyArrays: true
          }
        }
      ];
    }
    return this;
  },
  applyDateFilters() {
    // after stage step:
    let dateFilters = {};
    this.filtersArr
      .filter(({ filter }) => filter.period)
      .forEach(({ field, filter }) => {
        // [stop, <arrival|planned>, <planned|actual> ]
        const [s, m, t] = field.replace("period.", "").split("-");
        const [, pm, period] = filter.period.match(/([-+]{1})?([dwm]+)/);
        const tt = {
          d: "day",
          w: "week",
          m: "month"
        };

        const selPeriod = tt[period];

        // Adjust base date for 'last ..' and 'next ..'
        let mm = moment();
        if (pm === "-") {
          mm = mm.subtract(1, selPeriod);
        } else if (pm === "+") {
          mm = mm.add(1, selPeriod);
        }

        // Calculate boundaries of period
        const from = mm.startOf(selPeriod).toDate();
        const to = mm.endOf(selPeriod).toDate();

        dateFilters = {
          ...dateFilters,
          [`dates.${s}-${m}-${t}.value`]: {
            $gte: from,
            $lte: to
          }
        };
      });
    if (Object.keys(dateFilters).length > 0) {
      this.pipeline = [...this.pipeline, { $match: dateFilters }];
    }
    return this;
  },
  getInvoiceInfo() {
    if (this.getInvoiceDocs) {
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
                    $eq: ["$shipmentId", "$$shipmentId"]
                  }
                }
              },
              {
                $lookup: {
                  from: "invoices",
                  let: {
                    invoiceId: "$invoiceId"
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$invoiceId"]
                        }
                      }
                    },
                    {
                      $project: {
                        number: 1,
                        currency: "$amount.currency",
                        status: 1
                      }
                    }
                  ],
                  as: "invoiceHeader"
                }
              },
              {
                $project: {
                  _id: 0,
                  total: {
                    $reduce: {
                      input: "$costs",
                      initialValue: 0,
                      in: {
                        $sum: [
                          "$$value",
                          {
                            $multiply: [
                              "$$this.amount.value",
                              {
                                $ifNull: ["$$this.amount.rate", 1]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  },
                  count: {
                    $size: {
                      $ifNull: ["$costs", []]
                    }
                  },
                  invoiceId: 1,
                  currency: {
                    $arrayElemAt: ["$invoiceHeader.currency", 0]
                  },
                  number: {
                    $arrayElemAt: ["$invoiceHeader.number", 0]
                  },
                  status: {
                    $arrayElemAt: ["$invoiceHeader.status", 0]
                  }
                }
              }
            ],
            as: "invoices"
          }
        },

        // TODO; if this generates multiple invoices -> reduce this once more and generate 1x a result
        // this will duplicate shipments!!
        {
          $unwind: {
            path: "$invoices",
            preserveNullAndEmptyArrays: true
          }
        },
        ...getInvoiceCostField(this.view),
        ...getInvoiceDeltaField(this.view)
      ];
    }
    return this;
  },
  applyCostFilters() {
    if (get(this.view, ["filters", "deltaLargerThan"])) {
      const { value } = this.view.filters.deltaLargerThan;
      this.pipeline.push({
        $match: { "costs.delta": { $gte: parseInt(value, 10) } }
      });
    }
    return this;
  },
  projectFields() {
    this.pipeline = [
      ...this.pipeline,
      {
        $project: {
          created: 1, // sorting fallback
          access: 1,
          dates: 1,
          "planner-me": 1,
          "locations.pickup": 1,
          "locations.delivery": 1,
          "partners.shipper": "$shipper.name",
          "partners.consignee": "$consignee.name",
          "partners.carriers": "$carriers.name",
          "shipment.mode": "$type",
          "shipment.status": "$status",
          "shipment.number": "$number",
          "shipment.flags": "$flags",
          "shipment.drivers": "$firstStage.driverId", // to check
          "shipment.hasProject": "$hasProject",
          "shipment.hasPriceRequest": "$hasPriceRequest",
          invoices: "$invoices", // has to be reduced
          "shipment.costs": "$costs",
          references: 1,

          "item.itemReference": "$items.references",

          "projects.title": 1,
          entities: {
            $arrayElemAt: [{ $ifNull: ["$entityInfo.entities", []] }, 0]
          },
          context: getUserContext(this.accountId, this.userId)
        }
      }
    ];
    return this;
  },
  sort() {
    if (sort && typeof sort.column === "string") {
      debug("normal sort for %o", sort.column);
      this.pipeline.push({
        $sort: {
          [sort.column]: sort.dir === "asc" ? 1 : -1
        }
      });
    } else if (
      this.view &&
      this.view.order &&
      typeof this.view.order.col === "number"
    ) {
      const { dir, col } = this.view.order;

      // assume db view with sort per column index
      debug(
        "db view with sort for colomns %o , sort on index %o",
        this.columns,
        col
      );
      this.pipeline.push({
        $sort: {
          [this.columns[col]]: dir === "asc" ? 1 : -1
        }
      });
    } else {
      // default sort on created at
      this.pipeline.push({ $sort: { "created.at": -1 } });
    }
    return this;
  },
  async fetch(direct) {
    this.pipeline = [
      ...this.pipeline,
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // get a count of every result that matches until now
          results: { $push: "$$ROOT" } // keep our results for the next operation
        }
      },

      // and finally trim the results to within the range given by start/endRow
      {
        $project: {
          count: 1,
          rows: { $slice: ["$results", start, length] }
        }
      }
    ];

    debug(
      "pipeline : db.getCollection('shipments').aggregate( %j);",
      this.pipeline
    );

    try {
      let data;
      if (direct) {
        data = await Shipment._collection.aggregate(this.pipeline);
      } else {
        data = await Shipment.aggregateWithBuffer(this.pipeline);
      }
      if (!data || !data[0] || !data[0].rows) {
        debug("no data returned");
        return this.result;
      }

      debug("data %o", data);
      debug("ex %j", data[0].rows[0]);
      this.result.data = data[0].rows.map(row => dot.object(row));
      this.result.recordsTotal = parseInt(data[0].count, 10) || 0;
      this.result.recordsFiltered = parseInt(data[0].count, 10) || 0;
      this.result.jobId = Date.now();
      return this.result;
    } catch (e) {
      console.error("issue with shipment overview mongo", e);
      return this.result;
    }
  }
});

// filters:
//#region shipment:
const applyDateLimit = () => ({
  "updated.at": {
    $gte: moment()
      .subtract(60, "d")
      .startOf("day")
      .toDate()
  }
});

const defaultStatusFilter = () => ({
  status: { $nin: ["canceled", "deleted"] }
});
const statusFilter = view =>
  get(view, ["filters", "status", "values", "length"])
    ? { status: { $in: view.filters.status.values } }
    : undefined;
const entityFilter = view =>
  get(view, ["filters", "entities", "values", "length"])
    ? { "costParams.entity": { $in: view.filters.entities.values } }
    : undefined;
const plannerMeFilter = (view, userId) =>
  get(view, ["filters", "planner-me"]) ? { plannerIds: userId } : undefined;
const hasPriceRequestFilter = view =>
  get(view, ["filters", "hasPriceRequest"])
    ? { priceRequestId: { $exists: true } }
    : undefined;
const hasProjectFilter = view =>
  get(view, ["filters", "hasProject"])
    ? {
        $or: [
          { shipmentProjectInboundId: { $exists: true } },
          { shipmentProjectOutboundId: { $exists: true } }
        ]
      }
    : undefined;
const shipmentProjectInboundFilter = view =>
  get(view, ["filters", "projectIn", "values", "length"])
    ? { shipmentProjectInboundId: { $in: view.filters.projectIn.values } }
    : {};
const shipmentProjectOutboundFilter = view =>
  get(view, ["filters", "projectOut", "values", "length"])
    ? { shipmentProjectOutboundId: { $in: view.filters.projectOut.values } }
    : {};
const locationFilter = (filterArr = []) => {
  const filters = {};
  filterArr
    .filter(({ filter }) => filter.location)
    .forEach(({ field, filter }) => {
      if (Array.isArray(filter.location.countryCode)) {
        filters[`${field}.location.countryCode`] = {
          $in: filter.location.countryCode
        };
      } else {
        filters[`${field}.location.countryCode`] = filter.location.countryCode;
      }
    });
  return filters;
};
const shipperFilter = view =>
  get(view, ["filters", "shipper"])
    ? { shipperId: { $in: view.filters.shipper.values } }
    : undefined;
const consigneeFilter = view =>
  get(view, ["filters", "consignee"])
    ? { consigneeId: { $in: view.filters.consignee.values } }
    : undefined;
const carrierFilter = view =>
  get(view, ["filters", "carrier"])
    ? { carrierIds: { $in: view.filters.carrier.values } }
    : undefined;

const shipmentFlags = view => {
  const flagFilters = [];
  Object.keys(view.filters || {}).forEach(filterKey => {
    if (FLAGS.includes(filterKey)) {
      flagFilters.push(filterKey);
    }
  });
  if (flagFilters.length > 0) {
    return { flags: { $in: flagFilters } };
  }
  return undefined;
};
//#endregion

//#region stage -filter
const driverAllocationFilter = view => {
  const driverFilter = get(view, ["filters", "drivers"]);
  return driverFilter
    ? {
        $or: [
          ...(driverFilter.values.includes("none")
            ? [{ "stages.driverId": { $exists: false } }]
            : []),
          ...(driverFilter.values.includes("partial")
            ? [
                {
                  $and: [
                    {
                      stages: {
                        $elemMatch: {
                          driverId: {
                            $exists: true
                          }
                        }
                      }
                    },
                    {
                      stages: {
                        $elemMatch: {
                          driverId: {
                            $exists: false
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            : []),
          ...(driverFilter.values.includes("allocated")
            ? [
                {
                  stages: {
                    $not: {
                      $elemMatch: {
                        driverId: {
                          $exists: false
                        }
                      }
                    }
                  }
                }
              ]
            : [])
        ]
      }
    : undefined;
};
//#endregion

//#region projections - shipment:
const shipmentDates = () => ({
  "dates.created.value": "$created.at",
  "dates.updated.value": "$updated.at",

  // due to de-normalization:
  "dates.pickup-arrival-planned.value": "$pickup.datePlanned",
  "dates.pickup-arrival-scheduled.value": "$pickup.dateScheduled",
  "dates.pickup-arrival-actual.value": "$pickup.dateActual",
  "dates.delivery-arrival-planned.value": "$delivery.datePlanned",
  "dates.delivery-arrival-scheduled.value": "$delivery.dateScheduled",
  "dates.delivery-arrival-actual.value": "$delivery.dateActual"
});

// if there is a filter or a column (dir == pickup || delivery)
const locationFields = (view, columns, dir) => {
  if (
    columns.includes(`locations.${dir}`) ||
    get(view, ["filters", "pickup"])
  ) {
    return {
      [`locations.${dir}`]: {
        location: {
          $concat: [
            { $ifNull: [`$${dir}.location.countryCode`, ""] },
            {
              $ifNull: [
                { $substrBytes: [`$${dir}.location.zipCode`, 0, 2] },
                ""
              ]
            },
            { $ifNull: [`$${dir}.location.locode.id`, ""] },
            " ",
            { $ifNull: [`$${dir}.location.name`, ""] }
          ]
        },
        countryCode: `$${dir}.location.countryCode`,
        zipCode: `$${dir}.location.zipCode`,
        latLng: `$${dir}.location.latLng`,
        locode: `$${dir}.location.locode`,
        name: `$${dir}.location.name`
      }
    };
  }
  return undefined;
};

const hasPriceRequest = columns =>
  columns.includes("shipment.hasPriceRequest")
    ? {
        hasPriceRequest: { $gt: ["$priceRequestId", null] }
      }
    : undefined;

const plannerMe = (columns, userId) =>
  columns.includes("planner-me")
    ? {
        "planner-me": {
          $cond: {
            if: { $eq: ["$plannerIds", userId] },
            then: true,
            else: false
          }
        }
      }
    : undefined;

const hasProject = columns =>
  columns.includes("shipment.hasProject")
    ? {
        hasProject: {
          $or: [
            { $gt: ["$shipmentProjectInboundId", null] },
            { $gt: ["$shipmentProjectOutboundId", null] }
          ]
        }
      }
    : undefined;

// const carrierIds = columns =>
//   columns.includes("partners.carriers") ? { carrierIds: 1 } : undefined;

const shipperId = columns =>
  columns.includes("partners.shipper") ? { shipperId: 1 } : undefined;

const consigneeId = columns =>
  columns.includes("partners.consignee") ? { consigneeId: 1 } : undefined;

const shipmentCosts = view => {
  const hasCostField = view.columns.some(column =>
    startsWith(column, "costs.")
  );
  const hasDeltaField = view.columns.includes("costs.delta");
  const hasDeltaFilter = get(view, ["filters", "delta"]);

  if (hasCostField || hasDeltaField || hasDeltaFilter) {
    return {
      costs: {
        $reduce: {
          input: "$costs",
          initialValue: {},
          in: {
            total: {
              $sum: [
                {
                  $ifNull: ["$$value.total", 0]
                },
                {
                  $multiply: [
                    "$$this.amount.value",
                    {
                      $ifNull: ["$$this.amount.rate", 1]
                    }
                  ]
                }
              ]
            },
            count: {
              $sum: [
                {
                  $ifNull: ["$$value.count", 0]
                },
                1
              ]
            },
            currency: { $ifNull: ["$costParams.currency", "EUR"] }
          }
        }
      }
    };
  }
  return undefined;
};

const shipmentRefs = columns =>
  columns.some(c => c.match(/^references/))
    ? {
        references: 1
      }
    : undefined;

const projectRefs = columns =>
  columns.includes("projects.title")
    ? { shipmentProjectInboundId: 1, shipmentProjectOutboundId: 1 }
    : {};

const projectEntities = columns =>
  columns.some(c => c.match(/^entities/))
    ? {
        "costParams.entity": 1
      }
    : {};
//#endregion

//#region projections - invoice
const getInvoiceCostField = view => {
  const hasCostField = (view.columns || []).some(column => {
    return startsWith(column, "costs.");
  });
  const hasDeltaField = view.columns.includes("costs.delta");
  const hasDeltaFilter = get(view, ["filters", "delta"]);

  if (hasCostField || hasDeltaField || hasDeltaFilter) {
    return [
      {
        $addFields: {
          costs: {
            $reduce: {
              input: "$costs",
              initialValue: {},
              in: {
                total: {
                  $sum: [
                    {
                      $ifNull: ["$$value.total", 0]
                    },
                    {
                      $multiply: [
                        "$$this.amount.value",
                        {
                          $ifNull: ["$$this.amount.rate", 1]
                        }
                      ]
                    }
                  ]
                },
                count: {
                  $sum: [
                    {
                      $ifNull: ["$$value.count", 0]
                    },
                    1
                  ]
                }
              }
            }
          },
          "costs.currency": {
            $ifNull: ["$costParams.currency", "EUR"]
          }
        }
      }
    ];
  }
  return [{ $project: { costs: 0 } }];
};

const getInvoiceDeltaField = view =>
  view.columns.includes("costs.delta")
    ? [
        {
          $addFields: {
            "costs.delta": {
              $subtract: [
                {
                  $ifNull: ["$costs.total", 0]
                },
                {
                  $ifNull: ["$invoices.total", 0]
                }
              ]
            }
          }
        }
      ]
    : [];
//#endregion

const getAccountFields = accountId => [
  {
    $project: {
      name: {
        $let: {
          vars: {
            annotation: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: { $ifNull: ["$accounts", []] },
                    as: "annotation",
                    cond: { $eq: ["$$annotation.accountId", accountId] }
                  }
                },
                0
              ]
            }
          },
          in: { $ifNull: ["$$annotation.name", "$name"] }
        }
      }
    }
  }
];

const getUserContext = (accountId, userId) => ({
  $switch: {
    branches: [
      {
        case: { $in: [userId, { $ifNull: ["$plannerIds", []] }] },
        then: "isPlanner"
      },
      {
        case: { $eq: ["$accountId", accountId] },
        then: "isOwner"
      },
      {
        case: {
          $and: [
            {
              $anyElementTrue: {
                $map: {
                  input: { $ifNull: ["$access", []] },
                  in: { $eq: ["$$this.accountId", accountId] }
                }
              }
            },
            { $eq: ["$status", "draft"] }
          ]
        },
        then: "isBidder"
      },
      {
        case: { $in: [accountId, { $ifNull: ["$carrierIds", []] }] },
        then: "isCarrier"
      }
    ],
    default: "isPartner"
  }
});
