/* eslint-disable default-case */
import moment from "moment";
import { _ } from "meteor/underscore";
import startsWith from "underscore.string/startsWith";
import get from "lodash.get";
import dot from "dot-object";

import { FLAGS } from "/imports/api/_jsonSchemas/enums/shipment.js";
import { Shipment } from "../../shipments/Shipment";
import { oPath } from "/imports/utils/functions/path";

const debug = require("debug")("shipments:mongo:overview");

// shipment overview with mongo! on limited data set (only shipments of 2 months)
export const shipmentOverViewAggregation = ({
  accountId,
  view,
  sort,
  start,
  length
}) => {
  const result = {
    data: [],
    recordsTotal: 0,
    recordsFiltered: 0,
    jobId: new Date()
  };

  // we can add basic filters here to recude amount of data, ie status
  const filters = {};
  if (Array.isArray(get(view, "filters.status.values")))
    filters.status = { $in: view.filters.status.values };
  if (get(view, "filters.planner-me")) filters.plannerIds = this.userId;

  debug("easy filters on mongo", filters);
  const pipeline = [
    {
      $match: {
        $and: [
          {
            $or: [
              {
                accountId
              },
              { "access.accountId": accountId },
              {
                shipperId: accountId,
                status: {
                  $in: ["partial", "planned", "scheduled", "started"]
                }
              },
              {
                consigneeId: accountId,
                status: {
                  $in: ["partial", "planned", "scheduled", "started"]
                }
              },
              {
                carrierIds: accountId,
                status: {
                  $in: ["partial", "planned", "scheduled", "started"]
                }
              },
              {
                providerIds: accountId,
                status: {
                  $in: ["partial", "planned", "scheduled", "started"]
                }
              }
            ]
          },
          {
            status: {
              $nin: ["canceled", "deleted"]
            }
          },

          // keep only last 60 days of data
          {
            $or: [
              {
                "created.at": {
                  $gte: moment()
                    .subtract(60, "d")
                    .startOf("day")
                    .toDate()
                }
              },
              {
                "updated.at": {
                  $gte: moment()
                    .subtract(60, "d")
                    .startOf("day")
                    .toDate()
                }
              }
            ]
          },
          filters
        ]
      }
    }
  ];

  pipeline.push({
    $project: {
      edi: 0,
      updates: 0,
      simulation: 0
    }
  });
  debug("add default sort, and add additional:%o", sort);
  pipeline.push({
    $sort: {
      "created.at": -1
    }
  });

  // add flags for project and pricerequest
  pipeline.push({
    $addFields: {
      hasPriceRequest: {
        $cond: {
          if: "$priceRequestId",
          then: true,
          else: false
        }
      },
      "planner-me": {
        $cond: {
          if: { $eq: ["$plannerIds", this.userId] },
          then: true,
          else: false
        }
      },
      project: {
        $cond: {
          if: "$shipmentProjectInboundId",
          then: true,
          else: {
            $cond: {
              if: "$shipmentProjectOutboundId",
              then: true,
              else: false
            }
          }
        }
      }
    }
  });
  const hasColumns = _.find(view.columns, column => {
    // Date columns
    // Shipment mode (icons that are actually derived from stage modes)
    // Shipment driver (also from stages)
    return (
      (startsWith(column, "dates.") && column !== "dates.created") ||
      column === "shipment.mode" ||
      column === "shipment.drivers"
    );
  });
  const hasPeriodFilter = _.find(view.filters, filter => {
    return filter.period != null;
  });
  debug("check if we need to show dates %o ", {
    hasColumns,
    hasPeriodFilter
  });

  // carrierSearch first as this is performing not so good
  if (view.columns.indexOf("partners.carriers") > -1) {
    pipeline.push({
      $unwind: {
        path: "$carrierIds",
        preserveNullAndEmptyArrays: true
      }
    });
    pipeline.push({
      $lookup: {
        from: "carriers",
        localField: "carrierIds",
        foreignField: "_id",
        as: "carriers"
      }
    });
    pipeline.push({
      $addFields: {
        carriers: {
          name: "$carriers.name",
          id: "$carriers._id"
        }
      }
    });
  }

  // Add stages to the query if they are needed for the columns/filters
  if (hasColumns || hasPeriodFilter) {
    pipeline.push({
      $lookup: {
        from: "stages",
        localField: "_id",
        foreignField: "shipmentId",
        as: "stages"
      }
    });

    pipeline.push({
      $project: {
        access: {
          $filter: {
            input: "$access",
            as: "el",
            cond: { $eq: ["$$el.accountId", accountId] }
          }
        },
        status: 1,
        number: 1,
        shipperId: 1,
        consigneeId: 1,
        carrierIds: 1,
        carriers: 1,
        created: 1,
        updated: 1,
        pickup: 1,
        delivery: 1,
        stages: 1,
        tracking: 1,
        project: 1,
        "planner-me": 1,
        hasPriceRequest: 1,
        plannerIds: 1,
        flags: 1,
        references: 1,
        firstStage: {
          $arrayElemAt: ["$stages", 0]
        },
        lastStage: {
          $arrayElemAt: ["$stages", -1]
        }
      }
    });
  }

  // Add shipper name, but only if the column is present in the view
  if (view.columns.indexOf("partners.shipper") > -1) {
    pipeline.push({
      $lookup: {
        from: "shippers",
        let: {
          shipperId: "$shipperId"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$shipperId"]
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: "shipper"
      }
    });
    pipeline.push({
      $unwind: {
        path: "$shipper",
        preserveNullAndEmptyArrays: true
      }
    });
  }

  // Same for consignee
  if (view.columns.indexOf("partners.consignee") > -1) {
    pipeline.push({
      $lookup: {
        from: "shippers",
        let: {
          consigneeId: "$consigneeId"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$consigneeId"]
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: "consignee"
      }
    });
    pipeline.push({
      $unwind: {
        path: "$consignee",
        preserveNullAndEmptyArrays: true
      }
    });
  }

  // if invoice fields are required...
  if (
    (view.columns || []).some(column => {
      return startsWith(column, "invoices.");
    }) ||
    view.columns.indexOf("costs.delta") > -1 ||
    oPath(["filters", "delta"], view)
  ) {
    pipeline.push({
      $lookup: {
        from: "invoices.items",
        let: {
          shipmentId: "$_id"
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
                        $divide: [
                          "$$this.amount.value",
                          {
                            $ifNull: ["$$this.amount.exchange", 1]
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
    });

    // TODO; if this generates multiple invoices -> reduce this once more and generate 1x a result
    // this will duplicate shipments!!
    pipeline.push({
      $unwind: {
        path: "$invoices",
        preserveNullAndEmptyArrays: true
      }
    });
  }
  if (
    (view.columns || []).some(column => {
      return startsWith(column, "costs.");
    }) ||
    view.columns.indexOf("costs.delta") > -1 ||
    oPath(["filters", "delta"], view)
  ) {
    pipeline.push({
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
                    $divide: [
                      "$$this.amount.value",
                      {
                        $ifNull: ["$$this.amount.exchange", 1]
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
        }
      }
    });
    pipeline.push({
      $addFields: {
        "costs.currency": {
          $ifNull: ["$costParams.currency", "EUR"]
        }
      }
    });
  } else {
    pipeline.push({
      $project: {
        costs: 0
      }
    });
  }
  if (view.columns.indexOf("costs.delta") > -1) {
    pipeline.push({
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
    });
  }

  // Add filters to the query, not indexed!
  // eslint-disable-next-line consistent-return
  _.each(view.filters, (filter, field) => {
    // Fixed values
    if (_.isArray(filter.values)) {
      if (field === "drivers") {
        const drivers = [];
        if (filter.values.indexOf("none") > -1) {
          drivers.push({
            "stages.driverId": {
              $exists: false
            }
          });
        }
        if (filter.values.indexOf("partial") > -1) {
          drivers.push({
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
          });
        }
        if (filter.values.indexOf("allocated") > -1) {
          drivers.push({
            stages: {
              $not: {
                $elemMatch: {
                  driverId: {
                    $exists: false
                  }
                }
              }
            }
          });
        }
        return pipeline.push({
          $match: {
            $or: drivers
          }
        });
      }
      return pipeline.push({
        $match: {
          [`${field}`]: {
            $in: filter.values
          }
        }
      });
    }

    // build addfields for dates
    const addFieldObj = {
      "dates.created.value": "$created.at",
      "dates.updated.value": "$updated.at"
    };

    // Periods (date ranges)
    const dateBlocks = {
      dir: ["pickup", "delivery"],
      step: ["start", "arrival", "end"],
      status: ["planned", "scheduled", "started"]
    };
    dateBlocks.dir.forEach(dir => {
      dateBlocks.step.forEach(step => {
        dateBlocks.status.forEach(status => {
          addFieldObj[`dates.${dir}-${step}-${status}.value`] = `$${
            dir === "pickup" ? "firstStage" : "lastStage"
          }.dates.${dir}.${step}.${status}`;
        });
      });
    });

    pipeline.push({ $addFields: addFieldObj });
    if (filter.period) {
      if (field.indexOf("-") !== -1) {
        const [s, m, t] = field.split("-");
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
        const stage = s === "pickup" ? "firstStage" : "lastStage";
        return pipeline.push({
          $match: {
            [`${stage}.dates.${s}.${m}.${t}`]: {
              $gte: from,
              $lte: to
            }
          }
        });
      }

      // Location
    } else if (filter.location != null) {
      return pipeline.push({
        $match: {
          [`${field}.location.countryCode`]: filter.location.countryCode
        }
      });

      // Partner
    } else if (filter.partner != null) {
      switch (field) {
        case "shipper":
        case "consignee":
          return pipeline.push({ $match: { [`${field}Id`]: filter.partner } });
        case "carrier":
          return pipeline.push({ $match: { carrierIds: filter.partner } });
      }
    }

    switch (field) {
      case "tracking":
        return pipeline.push({
          $match: {
            "tracking.active": true,
            flags: { $ne: "tracking-failed" }
          }
        });
      case "planner-me":
        return pipeline.push({ $match: { plannerIds: this.userId } });
      case "project":
        return pipeline.push({ $match: { project: true } });
      case "deltaLargerThan":
        return pipeline.push({
          $match: { "costs.delta": { $gte: parseInt(filter.value, 10) } }
        });
    }

    // Flags
    if (FLAGS.indexOf(field) > -1) {
      return pipeline.push({ $match: { flags: field } });
    }
  });
  const fields = {
    access: 1,
    dates: 1,
    project: 1,
    "planner-me": 1,
    hasPriceRequest: 1,
    "locations.pickup": {
      location: {
        $concat: [
          { $ifNull: ["$pickup.location.countryCode", ""] },
          {
            $ifNull: [{ $substrBytes: ["$pickup.location.zipCode", 0, 2] }, ""]
          },
          { $ifNull: ["$pickup.location.locode.id", ""] },
          " ",
          { $ifNull: ["$pickup.location.name", ""] }
        ]
      },

      countryCode: "$pickup.location.countryCode",
      zipCode: "$pickup.location.zipCode",
      locode: "$pickup.location.locode",
      name: "$pickup.location.name"
    },
    "locations.delivery": {
      location: {
        $concat: [
          { $ifNull: ["$delivery.location.countryCode", ""] },
          {
            $ifNull: [
              { $substrBytes: ["$delivery.location.zipCode", 0, 2] },
              ""
            ]
          },
          { $ifNull: ["$delivery.location.locode.id", ""] },
          " ",
          { $ifNull: ["$delivery.location.name", ""] }
        ]
      },
      countryCode: "$delivery.location.countryCode",
      zipCode: "$delivery.location.zipCode",
      locode: "$delivery.location.locode",
      name: "$delivery.location.name"
    },
    "partners.shipper": "$shipper.name",
    "partners.consignee": "$consignee.name",
    "partners.carriers": "$carriers.name",
    "shipment.mode": "$type",
    "shipment.status": "$status",
    "shipment.number": "$number",

    // 'partners.carriers': '$carriers'
    invoices: "$invoices", // moet nog eens gereduceerd worden....
    costs: "$costs"
  };
  if (!oPath(["columns", "length"], view)) {
    fields.number = 1;
  }

  // Include references only if columns are activated
  if (view.columns.find(c => c.match(/^references/))) {
    fields.references = 1;
  }

  // Add these fields only if their column is included in the view
  _.each(
    {
      status: "shipment.status",
      flags: "shipment.flags",
      "stages.driverId": "shipment.drivers",
      "stages.mode": "shipment.mode",

      // 'edi.error': 'shipment.status'
      number: "shipment.number"
    },
    (column, field) => {
      if (view.columns.indexOf(column) > -1) {
        fields[field] = 1;
      }
    }
  );

  // eslint-disable-next-line consistent-return
  pipeline.push({
    $project: fields
  });

  // sort
  if (sort && sort.column) {
    pipeline.push({
      $sort: {
        [sort.column]: sort.dir === "asc" ? 1 : -1
      }
    });
  }
  pipeline.push(
    {
      $group: {
        _id: null,

        // get a count of every result that matches until now
        count: { $sum: 1 },

        // keep our results for the next operation
        results: { $push: "$$ROOT" }
      }
    },

    // and finally trim the results to within the range given by start/endRow
    {
      $project: {
        count: 1,
        rows: { $slice: ["$results", start, length] }
      }
    }
  );

  debug("pipeline : db.getCollection('shipments').aggregate( %j);", pipeline);
  try {
    return Shipment.aggregateWithBuffer(pipeline).then(data => {
      if (!data || !data[0] || !data[0].rows) {
        debug("no data returned");
        return result;
      }
      debug("data %o", data);
      debug("ex %j", data[0].rows[0]);
      result.data = data[0].rows.map(row => dot.object(row));
      result.recordsTotal = parseInt(data[0].count, 10) || 0;
      result.recordsFiltered = parseInt(data[0].count, 10) || 0;
      result.jobId = Date.now();
      return result;
    });
  } catch (e) {
    console.error("issue with shipment overview mongo", e);
    return result;
  }
};
