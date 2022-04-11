const debug = require("debug")("partner:search");

class PartnerSearch {
  constructor(pipeline) {
    this.pipeline = pipeline || [];
  }

  setAccount(accountId) {
    this.accountId = accountId;
    return this;
  }

  find({ filter = {} }) {
    // exclude accounts to remove acccounts from drop down that are already in list
    const {
      types,
      includeOwnAccount,
      excludeAccounts = [],
      includeInactive
    } = filter;
    this.pipeline = [
      ...this.pipeline,
      ...[
        {
          $match: {
            $or: [
              ...(includeOwnAccount ? [{ _id: this.accountId }] : []),
              {
                $and: [
                  { _id: { $nin: excludeAccounts } },
                  {
                    _id: { $ne: this.accountId },
                    deleted: { $ne: true },
                    "partners.accountId": this.accountId,
                    "partners.status": {
                      $nin: includeInactive
                        ? ["deleted", "rejected"] // also includes requested
                        : ["deleted", "rejected", "inactive"]
                    }
                  },
                  ...(types ? [{ type: { $in: types } }] : [])
                ]
              }
            ]
          }
        },

        // only return my account in partners array:
        {
          $addFields: {
            partners: {
              $filter: {
                input: "$partners",
                as: "partnership",
                cond: { $eq: ["$$partnership.accountId", this.accountId] }
              }
            }
          }
        }
      ]
    ];
    return this;
  }

  project() {
    this.pipeline = [
      ...this.pipeline,
      ...[
        {
          $project: {
            _id: 1,
            id: "$_id",
            type: 1,
            name: 1,
            partners: 1
          }
        }
      ]
    ];
    return this;
  }

  sort() {
    this.pipeline = [
      ...this.pipeline,
      ...[
        {
          $sort: {
            name: 1
          }
        }
      ]
    ];
    return this;
  }

  toDropDown() {
    this.pipeline.push({
      $project: {
        _id: 0,
        key: "$id",
        name: "$name",
        label: {
          $concat: ["$name", " <span style='opacity: .3'>— ", "$id", "</span>"]
        }
      }
    });
    return this;
  }

  get() {
    debug(
      "partner pipeline :  db.getCollection('accounts').aggregate(%j)",
      this.pipeline
    );
    return this.pipeline;
  }
}

export { PartnerSearch };
