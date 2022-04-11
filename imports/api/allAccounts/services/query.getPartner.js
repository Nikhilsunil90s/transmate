import { AllAccounts } from "../AllAccounts";

export const getPartner = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ partnerId }) {
    const res = await AllAccounts._collection.aggregate([
      { $match: { _id: partnerId } },

      // gets partnerShip info
      {
        $addFields: {
          partnership: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$partners", []] },
                  as: "partner",
                  cond: { $eq: ["$$partner.accountId", this.accountId] }
                }
              },
              0
            ]
          }
        }
      },

      // gets annotation -> name
      {
        $addFields: {
          annotation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$accounts", []] },
                  as: "annotation",
                  cond: { $eq: ["$$annotation.accountId", this.accountId] }
                }
              },
              0
            ]
          }
        }
      },

      {
        $addFields: {
          name: { $ifNull: ["$annotation.name", "$name"] }
        }
      },

      // projections
      { $project: { accounts: 0, partners: 0 } },
      { $addFields: { id: "$_id" } }
    ]);

    return res[0];
  }
});
