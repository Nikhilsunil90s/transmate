/* eslint-disable consistent-return */
/* eslint-disable camelcase */

import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { User } from "../users/User";

const defaultSubscription = {
  type: "free",
  asOf: new Date(),
  resetsOn: new Date(new Date().setMonth(new Date().getMonth() + 1)) // in a month
};

/**
 * collection to keep track of usage per account
 *
 */
class AccountsUsage extends Model {
  /**
   * Record credit usage for activity
   * @param {String} topic - topic key.
   * @throws an error if credit is consumed
   */
  static async consume({ topic, data }) {
    const accountId = await User.getAccountId();

    this._collection.update(
      { _id: accountId },
      {
        $inc: { [`usage.${topic}.count`]: 1 },
        $push: {
          [`usage.${topic}.history`]: {
            $each: [{ data, date: new Date() }],
            $sort: { date: -1 },
            $slice: 10 // only keep 10 most recent ones
          }
        },
        $setOnInsert: { subscription: defaultSubscription }
      },
      { upsert: true }
    );

    // 2nd call for all activities

    // check if we have a usage conflict
  }
}

AccountsUsage._collection = new Mongo.Collection("accounts.usage");

export { AccountsUsage };

/*
Schema:
_id: accountId,
 subscription: {
    optional: true,
    type: new SimpleSchema({
      initialDate: {type: Date, autoValue: new Date()}
      resetsOn: {type: Date}
    }),
    blackbox: true
  },

  // usageStats
  usage: {
    optional: true,
    defaultValue: {},
    type: new SimpleSchema({
      resetsOn: { type: Date },
      stats: { type: Object, blackbox: true }
      // stats.<key>.count
      // stats.<key>.limit
      // stats.<key>.history
    })
  },
  monthlyStats: // when resets -> add to here...


*/
