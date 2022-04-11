import { AllAccounts } from "../AllAccounts";

export const pipelineBuilder = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  pipeline: [],
  find({ fields = {} }) {
    this.pipeline = [
      ...this.pipeline,
      { $match: { _id: this.accountId } },
      { $project: { ...fields, id: "$_id" } }
    ];
    return this;
  },
  getUsers() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "users",
          let: { userIds: "$userIds" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", { $ifNull: ["$$userIds", []] }] }
              }
            },
            { $project: { id: "$_id", profile: 1, emails: 1 } }
          ],
          as: "users"
        }
      }
    ];
    return this;
  },
  getUserBaseRoles() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "role-assignment",
          let: { userIds: "$userIds" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $in: ["$user._id", "$$userIds"] } },
                  { scope: `account-${this.accountId}` }
                ]
              }
            },
            {
              $group: {
                _id: "$user._id",
                baseRoles: { $addToSet: "$role._id" }
              }
            }
          ],
          as: "roleAssignment"
        }
      }
    ];
    return this;
  },
  getUserEntities() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "role-assignment",
          let: { userIds: "$userIds" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $in: ["$user._id", "$$userIds"] } },
                  { scope: { $regex: `^entity-${this.accountId}` } }
                ]
              }
            },
            {
              $addFields: {
                entity: {
                  $substrBytes: [
                    "$scope",
                    { $strLenBytes: `entity-${this.accountId}-` },
                    {
                      $subtract: [
                        { $strLenBytes: "$scope" },
                        { $strLenBytes: `entity-${this.accountId}-` }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $group: { _id: "$user._id", entities: { $addToSet: "$entity" } }
            }
          ],
          as: "entityAssignment"
        }
      }
    ];
    return this;
  },
  async fetchOne() {
    const res = await AllAccounts._collection.aggregate(this.pipeline);

    // eslint-disable-next-line prefer-destructuring
    this.account = res[0];
    return this.account;
  },
  postProcessMergeUserAndRoles() {
    const { users = [], roleAssignment = [], entityAssignment = [] } =
      this.account || {};
    this.account.users = users.map(user => ({
      ...user,
      baseRoles:
        roleAssignment.find(({ _id: usrId }) => usrId === user.id)?.baseRoles ||
        [],
      entities:
        entityAssignment.find(({ _id: usrId }) => usrId === user.id)
          ?.entities || []
    }));
  },
  get() {
    return this.account;
  }
});
