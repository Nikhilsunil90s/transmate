/* eslint-disable camelcase */
import { oPath } from "/imports/utils/functions/path";
import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";
import moment from "moment";
import Model from "../Model";
import { PriceListSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list";

// collections
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { PriceListServiceSRV } from "/imports/api/pricelists/services/priceLists-server";
import { User } from "../users/User";

const debug = require("debug")("pricelist:db");

const getCarrierName = ({ carrierId, accountId }) => {
  let carrierName;
  const carrier = AllAccounts.first(
    { _id: carrierId },
    {
      fields: {
        accounts: { $elemMatch: { accountId } },
        name: 1
      }
    }
  );

  if (carrier) {
    debug("add carrier name : %o", carrier.getName());
    carrierName = carrier.getName();
  }

  return carrierName;
};

const getCarrierName_async = async ({ carrierId, accountId }) => {
  let carrierName;
  const carrier = await AllAccounts.first(
    { _id: carrierId },
    {
      fields: {
        accounts: { $elemMatch: { accountId } },
        name: 1
      }
    }
  );

  if (carrier) {
    carrierName = carrier.getName();
    debug("add carrier name : %o", carrierName);
  }

  return carrierName;
};

class PriceList extends Model {
  // eslint-disable-next-line camelcase
  static async before_create_async(obj, { userId, accountId }) {
    debug("context %o", { userId });
    const newObj = obj;
    delete newObj.createdAt;
    newObj.created = obj.created || {
      by: userId,
      at: oPath(["created", "at"], newObj) || new Date()
    };

    if (!newObj.status) {
      newObj.status = "draft";
    }
    newObj.carrierName = await getCarrierName_async({
      carrierId: newObj.carrierId,
      accountId
    });

    newObj.updates = obj.updates || [
      {
        action: "created",
        userId: newObj.created.by,
        accountId: newObj.creatorId,
        ts: new Date()
      }
    ];

    return newObj;
  }

  // eslint-disable-next-line camelcase
  static async before_save(obj) {
    const newObj = obj;
    debug("before save pricelist obj : %o", (obj || {})._id);
    try {
      const accountId = obj.accountId || User.getAccountId();
      newObj.carrierName = getCarrierName({
        carrierId: obj.carrierId,
        accountId
      });
    } catch (e) {
      // probably a server update
    }

    // set carrier name on object to facilitate search and tables.

    return newObj;
  }

  // eslint-disable-next-line camelcase
  static after_save(obj) {
    debug("after save pricelist obj : %o", (obj || {})._id);

    // this method sets the summary
    PriceListServiceSRV.setStats({ priceListId: obj._id });
  }

  static activeQuery(accountId, simulation = false, date = new Date()) {
    let query;
    if (!simulation) {
      query = {
        $or: [
          {
            creatorId: accountId
          },
          {
            carrierId: accountId,
            status: "active"
          },
          {
            shipperId: accountId,
            status: "active"
          }
        ]
      };
      if (AllAccounts.getType(accountId) !== "carrier") {
        query.$or.push({
          type: "global",
          status: "active"
        });
      }
      query.validFrom = {
        $lte: date
      };
      query.validTo = {
        $gte: date
      };
    } else {
      query = {
        $or: [
          {
            creatorId: accountId
          },
          {
            carrierId: accountId
          },
          {
            shipperId: accountId
          }
        ]
      };
    }

    // Filter out deleted/archived price lists
    query.deleted = false;
    query.status = {
      $ne: "archived"
    };
    return query;
  }

  static locationQuery(fromTo, input) {
    check(
      fromTo,
      Match.Where(s => {
        return /^from|to$/.test(s);
      })
    );
    check(input, {
      addressId: Match.Optional(
        Match.Where(s => {
          return SimpleSchema.RegEx.Id.test(s);
        })
      ),
      locationId: Match.Optional(
        Match.Where(s => {
          return SimpleSchema.RegEx.Id.test(s);
        })
      ),
      zipCode: Match.Optional(String),
      countryCode: Match.Optional(
        Match.Where(s => {
          return /^[A-Z]{2}$/.test(s);
        })
      )
    });
    const { addressId, locationId, countryCode, zipCode } = input;
    const $or = [];
    if (addressId) {
      $or.push({
        [`lanes.${fromTo}.addressIds`]: addressId
      });
    }
    if (locationId) {
      $or.push({
        [`lanes.${fromTo}.locationIds`]: locationId
      });
    }
    if (countryCode && zipCode) {
      $or.push({
        $or: [
          {
            [`lanes.${fromTo}.zones`]: {
              $elemMatch: {
                0: countryCode,
                1: "*"
              }
            }
          },
          {
            [`lanes.${fromTo}.zones`]: {
              $elemMatch: {
                0: countryCode,
                1: zipCode,
                2: null
              }
            }
          },
          {
            [`lanes.${fromTo}.zones`]: {
              $elemMatch: {
                0: countryCode,
                1: {
                  $lte: zipCode
                },
                2: {
                  $gt: zipCode
                }
              }
            }
          }
        ]
      });
    }
    return { $or };
  }

  // This is an improved version of location query, better able to handle zip
  // codes of varying lengths
  static locationQuery2(fromTo, input, field = "$lanes") {
    check(
      fromTo,
      Match.Where(s => {
        return /^from|to$/.test(s);
      })
    );
    check(input, {
      addressId: Match.Optional(
        Match.Where(s => {
          return SimpleSchema.RegEx.Id.test(s);
        })
      ),
      locationId: Match.Optional(
        Match.Where(s => {
          return SimpleSchema.RegEx.Id.test(s);
        })
      ),
      zipCode: Match.Optional(String),
      countryCode: Match.Optional(
        Match.Where(s => {
          return /^[A-Z]{2}$/.test(s);
        })
      )
    });
    const { addressId, locationId, countryCode, zipCode } = input;
    const $or = [];
    if (addressId) {
      $or.push({
        $in: [
          addressId,
          {
            $ifNull: [`${field}.${fromTo}.addressIds`, []]
          }
        ]
      });
    }
    if (locationId) {
      $or.push({
        $in: [
          locationId,
          {
            $ifNull: [`${field}.${fromTo}.locationIds`, []]
          }
        ]
      });
    }
    if (countryCode && zipCode) {
      $or.push({
        $anyElementTrue: {
          $map: {
            input: {
              $ifNull: [`${field}.${fromTo}.zones`, []]
            },
            as: "zone",
            in: {
              $let: {
                vars: {
                  countryCode: "$$zone.CC",
                  zipFrom: "$$zone.from",
                  zipTo: "$$zone.to",
                  zipFromSize: {
                    $ifNull: [
                      {
                        $strLenBytes: {
                          $ifNull: ["$$zone.from", ""]
                        }
                      },
                      1
                    ]
                  },
                  zipToSize: {
                    $ifNull: [
                      {
                        $strLenBytes: {
                          $ifNull: ["$$zone.to", ""]
                        }
                      },
                      1
                    ]
                  }
                },

                // Check if the given countryCode/zipCode are within the range of this
                // zone:
                in: {
                  $or: [
                    {
                      // 1. Country wildcard (country code + "*" as zipcode)
                      $and: [
                        {
                          $eq: ["$$countryCode", countryCode]
                        },
                        {
                          $eq: ["$$zipFrom", "*"]
                        }
                      ]
                    },
                    {
                      // 2. Exact zip code match (not a range)
                      $and: [
                        {
                          $eq: ["$$countryCode", countryCode]
                        },
                        {
                          $eq: ["$$zipFrom", zipCode]
                        },
                        {
                          $eq: ["$$zipTo", null]
                        }
                      ]
                    },
                    {
                      // 3. Zip code within range
                      // $substrBytes is used to make sure we only compare the same number
                      // of characters. This prevents false positives.
                      $and: [
                        {
                          $eq: ["$$countryCode", countryCode]
                        },
                        {
                          // Zip from (less than or equal)
                          $or: [
                            {
                              $eq: [
                                {
                                  $strcasecmp: [
                                    "$$zipFrom",
                                    {
                                      $substrBytes: [
                                        zipCode,
                                        0,
                                        "$$zipFromSize"
                                      ]
                                    }
                                  ]
                                },
                                -1
                              ]
                            },
                            {
                              $eq: [
                                {
                                  $strcasecmp: [
                                    "$$zipFrom",
                                    {
                                      $substrBytes: [
                                        zipCode,
                                        0,
                                        "$$zipFromSize"
                                      ]
                                    }
                                  ]
                                },
                                0
                              ]
                            }
                          ]
                        },
                        {
                          // Zip to (greater than or equal)
                          $or: [
                            {
                              $eq: [
                                {
                                  $strcasecmp: [
                                    "$$zipTo",
                                    {
                                      $substrBytes: [zipCode, 0, "$$zipToSize"]
                                    }
                                  ]
                                },
                                1
                              ]
                            },
                            {
                              $eq: [
                                {
                                  $strcasecmp: [
                                    "$$zipTo",
                                    {
                                      $substrBytes: [zipCode, 0, "$$zipToSize"]
                                    }
                                  ]
                                },
                                0
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      });
    }
    return { $or };
  }

  constructTitle() {
    const date = moment(this.created.at).format("DDMMY");
    const customerName = oPath(["name"], this.customer());
    const carrierName = oPath(["name"], this.carrier());
    return `${customerName} - ${carrierName} - ${this.category} - ${this.type} - ${this.mode} - ${date}`;
  }

  termsFormatted() {
    let formattedValue;
    if (oPath(["terms", "days"], this) && oPath(["terms", "condition"], this)) {
      if (this.terms.condition === "eom") {
        formattedValue = `Net EOM ${this.terms.days}`;
      }
      formattedValue = `Net ${this.terms.days}`;
    }
    return formattedValue;
  }

  isExpired() {
    if (typeof this.validTo === "string")
      return new Date(this.validTo) < new Date();
    return this.validTo < new Date();
  }

  setStatus(status) {
    return this.save_async({ status });
  }

  async updateHistory(action) {
    return this.push({
      updates: {
        action,
        userId: "server",
        accountId: this.creatorId || "server",
        ts: new Date()
      }
    });
  }

  delete() {
    return this.deleteFlag();
  }
}

PriceList._collection = new Mongo.Collection("price.list");

PriceList._collection.attachSchema(PriceListSchema);
PriceList._collection = PriceList.updateByAt(PriceList._collection);

// keep track of changes!
PriceList._collection = PriceList.storeChanges(PriceList._collection);
export { PriceList };

// Factory.define('priceList', PriceList, { });
