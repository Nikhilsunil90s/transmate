import { Meteor } from "meteor/meteor";
import round from "mongo-round";
import { AnalysisSimulationV2 } from "../../analysis-simulation/AnalysisSimulationV2.js";
import { Tender } from "/imports/api/tenders/Tender.js";
import { oPath } from "/imports/utils/functions/path.js";

class ScopeService {
  constructor() {
    this.pipeline = [];
  }

  static scopeNameGenerator(scope) {
    const DG = oPath(["goodsDGClass"], scope);
    const equipment = oPath(["equipments", "name"], scope);
    const rngName = oPath(["volumes", "ranges", "name"], scope);
    let { name } = scope.lanes;
    name += rngName ? ` (${rngName})` : "";
    name += equipment ? ` eq:${equipment.name}` : "";
    name +=
      scope.goodsDG != null ? ` - ${scope.goodsDG ? "DG" : "non-DG"}` : "";
    name += DG ? ` - ${DG}` : "";
    return name;
  }

  setCollections({ type, documentId }) {
    switch (type) {
      case "simulation":
        this.collection = AnalysisSimulationV2;
        this.params = {
          documentId,
          type,
          queryKey: "analysisId",
          root: "analysisId",
          detailsCollection: "analysis.simulationV2.details"
        };
        break;
      case "tender":
        this.collection = Tender;
        this.params = {
          documentId,
          type,
          queryKey: "_id",
          root: "tenderId",
          detailsCollection: "tenders.details"
        };
        break;
      default:
        throw new Meteor.Error("not-found", "type not found");
    }
    return this;
  }

  scopeDef() {
    // unwinds the scope defenition into an array of possibilities:
    switch (this.params.type) {
      case "simulation":
        this.pipeline.push({
          $match: {
            analysisId: this.params.documentId
          }
        });
        break;
      default:
        this.pipeline.push({
          $match: {
            _id: this.params.documentId
          }
        });
    }
    this.pipeline = [
      ...this.pipeline,
      {
        $project: {
          [`${this.params.root}`]: `$${
            this.params.queryKey || "_id" // ! ! need this
          }`,
          lanes: "$scope.lanes",
          goodsDG: {
            $cond: {
              if: {
                $in: [
                  "DG",
                  {
                    $ifNull: ["$scope.definition", []]
                  }
                ]
              },
              then: "$scope.goodsDG",
              else: []
            }
          },
          goodsDGClass: {
            $cond: {
              if: {
                $in: [
                  "DG-class",
                  {
                    $ifNull: ["$scope.definition", []]
                  }
                ]
              },
              then: "$scope.goodsDGClass",
              else: []
            }
          },
          volumes: {
            $cond: {
              if: {
                $in: [
                  "volumes",
                  {
                    $ifNull: ["$scope.definition", []]
                  }
                ]
              },
              then: "$scope.volumes",
              else: []
            }
          },
          equipments: {
            $cond: {
              if: {
                $in: [
                  "equipments",
                  {
                    $ifNull: ["$scope.definition", []]
                  }
                ]
              },
              then: "$scope.equipments",
              else: []
            }
          },
          months: {
            $cond: {
              if: {
                $and: [
                  {
                    $in: [
                      "seasonality",
                      {
                        $ifNull: ["$scope.definition", []]
                      }
                    ]
                  },
                  {
                    $eq: ["$scope.seasonality", "month"]
                  }
                ]
              },
              then: {
                $range: [0, 12]
              },
              else: []
            }
          },
          weeks: {
            $cond: {
              if: {
                $and: [
                  {
                    $in: [
                      "seasonality",
                      {
                        $ifNull: ["$scope.definition", []]
                      }
                    ]
                  },
                  {
                    $eq: ["$scope.seasonality", "week"]
                  }
                ]
              },
              then: {
                $range: [0, 52]
              },
              else: []
            }
          }
        }
      },
      {
        $unwind: {
          path: "$lanes",
          includeArrayIndex: "lanes.sortIndex"
        }
      },
      {
        $unwind: {
          path: "$goodsDG",
          preserveNullAndEmptyArrays: true // [y/n]
        }
      },
      {
        $unwind: {
          path: "$goodsDGClass",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$volumes",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$volumes.ranges",
          includeArrayIndex: "volumes.ranges.sortIndex",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$equipments",
          includeArrayIndex: "equipments.sortIndex",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$months",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$weeks",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          [`${this.params.root}`]: 1,
          weeks: 1,
          months: 1,
          goodsDGClass: 1,
          goodsDG: 1,
          lanes: 1,

          // needed to remove null index field:
          equipments: {
            $cond: [
              { $eq: ["$equipments.sortIndex", null] },
              "$$REMOVE",
              "$equipments"
            ]
          },
          volumes: {
            $cond: [
              { $eq: ["$volumes.ranges.sortIndex", null] },
              "$$REMOVE",
              "$volumes"
            ]
          }
        }
      },
      {
        $addFields: {
          laneId: "$lanes.id",
          volumeGroupId: { $ifNull: ["$volumes.id", null] },
          volumeRangeId: { $ifNull: ["$volumes.ranges.id", null] },
          equipmentId: { $ifNull: ["$equipments.id", null] },
          goodsDG: { $ifNull: ["$goodsDG", null] }
        }
      }
    ];
    return this;
  }

  enrichScope() {
    // adds extra data to the unwound scope: WARNING: SLOWS DOWN the query
    ["locations", "address"].forEach(topic => {
      let d;
      if (topic === "locations") d = { id: "locationIds", col: "locations" };
      if (topic === "address") d = { id: "addressIds", col: "addresses" };
      ["from", "to"].forEach(dir => {
        this.pipeline.push({
          $lookup: {
            from: d.col,
            let: { ids: { $ifNull: [`$lanes.${dir}.${d.id}`, []] } },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
              { $project: { countryCode: 1, locationcode: 1, name: 1, zip: 1 } }
            ],
            as: `lanes.${dir}.${topic}`
          }
        });
      });
    });
    return this;
  }

  getDetails(preserve) {
    // important: make sure this matches all possible key fields in the document otherwise we can get
    // double counts!!
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: `${this.params.detailsCollection}`,
          let: {
            [`${this.params.root}`]: `$${
              this.params.root // different from analysis
            }`,
            laneId: "$laneId",
            goodsDG: "$goodsDG",
            volumeGroupId: "$volumeGroupId",
            volumeRangeId: "$volumeRangeId",
            equipmentId: "$equipmentId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [`$${this.params.root}`, `$$${this.params.root}`] },
                    { $eq: ["$laneId", "$$laneId"] },
                    { $eq: ["$goodsDG", "$$goodsDG"] },
                    { $eq: ["$volumeGroupId", "$$volumeGroupId"] },
                    { $eq: ["$volumeRangeId", "$$volumeRangeId"] },
                    { $eq: ["$equipmentId", "$$equipmentId"] }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                quantity: 1,
                priceLists: 1
              }
            }
          ],
          as: "detail"
        }
      },
      {
        $unwind: {
          path: "$detail",
          ...(preserve ? { preserveNullAndEmptyArrays: true } : {})
        }
      }
    ];
    if (this.params && this.params.getLocDef) {
      // lookup the from CC (and to data) as this is not available for address or locodes
      ["from", "to"].forEach(dir => {
        this.pipeline.push.apply(this.pipeline, [
          {
            $lookup: {
              from: "addresses",
              let: {
                addressId: {
                  $arrayElemAt: [`$lanes.${dir}.addressIds`, 0]
                }
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$addressId"]
                    }
                  }
                },
                {
                  $limit: 1
                },
                {
                  $project: {
                    countryCode: 1,
                    zip: 1,
                    name: 1
                  }
                }
              ],
              as: `${dir}Addr`
            }
          },
          {
            $unwind: {
              path: `$${dir}Addr`,
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "locations",
              let: {
                locationId: {
                  $arrayElemAt: [`$lanes.${dir}.locationIds`, 0]
                }
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$locationId"]
                    }
                  }
                },
                {
                  $limit: 1
                },
                {
                  $project: {
                    countryCode: 1,
                    locationCode: 1,
                    name: 1
                  }
                }
              ],
              as: `${dir}Locode`
            }
          },
          {
            $unwind: {
              path: `$${dir}Locode`,
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
        return this.pipeline.push({
          $addFields: {
            [`${dir}CC`]: {
              $let: {
                vars: {
                  [`${dir}Zone`]: `$lanes.${dir}.zones`,
                  [`${dir}Address`]: `$${dir}Addr`,
                  [`${dir}Locode`]: `$${dir}Locode`
                },
                in: {
                  $ifNull: [
                    `$$${dir}Zone.CC`,
                    {
                      $ifNull: [
                        `$$${dir}Address.countryCode`,
                        `$$${dir}Locode.countryCode`
                      ]
                    }
                  ]
                }
              }
            },
            [`${dir}PC`]: {
              $let: {
                vars: {
                  [`${dir}Zone`]: `$lanes.${dir}.zones`,
                  [`${dir}Address`]: `$${dir}Addr`,
                  [`${dir}Locode`]: `$${dir}Locode`
                },
                in: {
                  $ifNull: [`$$${dir}Zone.from`, `$$${dir}Address.zip`]
                }
              }
            }
          }
        });
      });
      this.pipeline.push(
        {
          $unwind: {
            path: "$fromCC",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$toCC",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$fromPC",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$toPC",
            preserveNullAndEmptyArrays: true
          }
        }
      );
    }
    return this;
  }

  groupByLaneRoot() {
    this.pipeline.push({
      $group: {
        _id: {
          lanefromcountry: "$fromCC",
          lanefromzip: "$fromPC",
          lanefromLocode: "$fromLocode.locationCode",
          lanefromName: "$fromLocode.name", // or from address?
          lanetocountry: "$toCC",
          lanetozip: "$toPC",
          lanetoLocode: "$toLocode.locationCode",
          lanetoName: "$toLocode.name", // or from address?
          equipment: "$equipments.name"
        },

        // DG flag
        // DG type
        // other condition
        shipmentIds: {
          $push: "$shipmentId"
        },
        count: {
          $sum: 1 // amount of bid groups aggregated?
        },
        shipCount: {
          $sum: "$detail.quantity.count"
        },
        totalAmount: {
          $sum: "$detail.quantity.amount"
        },
        avgAmount: {
          $avg: "$detail.quantity.amount"
        },
        minAmount: {
          $min: "$detail.quantity.amount"
        },
        maxAmount: {
          $max: "$detail.quantity.amount"
        },
        stdevAmount: {
          $stdDevPop: "$detail.quantity.amount"
        },

        // currentCost: $sum: '$detail.quantity.currentCost'
        currentAvgLeadtime: {
          $avg: "$detail.quantity.leadTime"
        }
      }
    });
    this.pipeline.push({
      $project: {
        pickupCountry: "$_id.lanefromcountry",
        pickupZip: "$_id.lanefromzip",
        pickupLocode: "$_id.lanefromLocode",
        pickupName: "$_id.lanefromName",
        deliveryCountry: "$_id.lanetocountry",
        deliveryZip: "$_id.lanetozip",
        deliveryLocode: "$_id.lanetoLocode",
        deliveryName: "$_id.lanetoName",
        equipment: "$_id.equipment",
        shipmentIds: 1,
        count: 1,
        shipCount: 1,
        totalAmount: round("$totalAmount", 2),
        avgAmount: round("$avgAmount", 2),
        minAmount: round("$minAmount", 2),
        maxAmount: round("$maxAmount", 2),
        stdevAmount: round("$stdevAmount", 2),

        // currentCost: $sum: '$detail.quantity.currentCost'
        currentAvgLeadtime: round("$currentAvgLeadtime", 2)
      }
    });
    return this;
  }

  groupPackages() {
    // group by origin
    this.pipeline.push({
      $group: {
        _id: {
          packageCountry: "$pickupCountry"
        },
        bidGroups: {
          $addToSet: {
            pickupCountry: "$pickupCountry",
            pickupZip: "$pickupZip",
            pickupLocode: "$pickupLocode",
            pickupName: "$pickupName",
            deliveryCountry: "$deliveryCountry",
            deliveryZip: "$deliveryZip",
            deliveryLocode: "$deliveryLocode",
            deliveryName: "$deliveryName",
            equipment: "$equipment",

            // DG flag
            // DG type
            // condition
            shipmentIds: "$shipmentIds",
            quantity: {
              scopeCount: "$count",
              shipCount: "$shipCount",
              totalAmount: "$totalAmount",
              avgAmount: "$avgAmount",
              minAmount: "$minAmount",
              maxAmount: "$maxAmount",
              stdevAmount: "$stdevAmount",

              // currentCost: '$currentCost'
              currentAvgLeadtime: "$currentAvgLeadtime"
            }
          }
        }
      }
    });
    this.pipeline.push({
      $project: {
        _id: 0,
        pickupCountry: "$_id.packageCountry",
        bidGroups: "$bidGroups"
      }
    });
    return this;
  }

  sortPackages() {
    this.pipeline.push.apply(this.pipeline, [
      {
        $unwind: "$bidGroups"
      },
      {
        $sort: {
          "bidGroups.pickupCountry": 1,
          "bidGroups.pickupZip": 1,
          "bidGroups.pickupLocode": 1,
          "bidGroups.deliveryCountry": 1,
          "bidGroups.deliveryZip": 1,
          "bidGroups.deliveryLocode": 1
        }
      },
      {
        $group: {
          _id: "$pickupCountry",
          bidGroups: {
            $push: "$bidGroups"
          }
        }
      },
      {
        $project: {
          _id: 0,
          pickupCountry: "$_id",
          bidGroups: "$bidGroups"
        }
      }
    ]);
    return this;
  }

  add(steps = []) {
    this.pipeline = [...this.pipeline, ...steps];
    return this;
  }

  aggregate(debug) {
    if (debug) console.info(JSON.stringify(this.pipeline));
    return this.collection._collection.aggregate(this.pipeline);
  }

  get(debug) {
    if (debug) {
      console.info(JSON.stringify(this.pipeline));
    }
    return this.pipeline;
  }
}

export { ScopeService };
