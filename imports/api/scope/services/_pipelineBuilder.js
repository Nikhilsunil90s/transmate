import get from "lodash.get";
import round from "mongo-round";

export const scopeDef = (pipeline, params) => {
  switch (params.type) {
    case "simulation":
      pipeline.push({
        $match: {
          analysisId: params.documentId
        }
      });
      break;
    default:
      pipeline.push({
        $match: {
          _id: params.documentId
        }
      });
  }
  return pipeline.push.apply(pipeline, [
    {
      $project: {
        [`${params.root}`]: `$${
          params.queryKey || "_id" // ! ! need this
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
        path: "$lanes"
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
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: "$equipments",
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
        _id: 0
      }
    }
  ]);
};

export const getDetails = (pipeline, params) => {
  // important: make sure this matches all possible key fields in the document otherwise we can get doulbe counts!!
  pipeline.push.apply(pipeline, [
    {
      $lookup: {
        from: `${params.detailsCollection}`,
        let: {
          [`${params.root}`]: `$${
            params.root // different from analysis
          }`,
          laneId: "$lanes.id",
          goodsDG: "$goodsDG",
          volumeGroupId: "$volumes.id",
          volumeRangeId: "$volumes.ranges.id",
          equipmentId: "$equipments.id"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [`$${params.root}`, `$$${params.root}`]
                  },
                  {
                    $eq: ["$laneId", "$$laneId"]
                  },
                  {
                    $eq: ["$goodsDG", { $ifNull: ["$$goodsDG", null] }]
                  },
                  {
                    $eq: [
                      "$volumeGroupId",
                      { $ifNull: ["$$volumeGroupId", null] }
                    ]
                  },
                  {
                    $eq: [
                      "$volumeRangeId",
                      { $ifNull: ["$$volumeRangeId", null] }
                    ]
                  },
                  {
                    $eq: ["$equipmentId", "$$equipmentId"]
                  }
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
        path: "$detail"
      }
    }
  ]);
  if ((params != null ? params.getLocDef : undefined) === true) {
    // lookup the from CC (and to data) as this is not available for address or locodes
    ["from", "to"].forEach(dir => {
      pipeline.push.apply(pipeline, [
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
      return pipeline.push({
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
    pipeline.push(
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
};

export const groupByLaneRoot = pipeline => {
  pipeline.push({
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
  return pipeline.push({
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
};

export const groupPackages = pipeline => {
  // group by origin
  pipeline.push({
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
  return pipeline.push({
    $project: {
      _id: 0,
      pickupCountry: "$_id.packageCountry",
      bidGroups: "$bidGroups"
    }
  });
};

export const sortPackages = pipeline => {
  return pipeline.push.apply(pipeline, [
    {
      $unwind: "$bidGroups"
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
    }
  ]);
};

export const scopeNameGenerator = scope => {
  let { name } = scope.lanes;
  const rngName = get(scope, ["volumes", "ranges", "name"]);
  const eqName = get(scope, ["equipments", "name"]);
  const DG = scope.goodsDGClass;

  name += rngName ? ` (${rngName})` : "";
  name += eqName ? ` eq:${eqName}` : "";
  name += scope.goodsDG != null ? ` - ${scope.goodsDG ? "DG" : "non-DG"}` : "";
  name += DG ? ` - ${DG}` : "";
  return name;
};
