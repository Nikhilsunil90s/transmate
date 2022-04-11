import { Address } from "/imports/api/addresses/Address";

export const getAddresses = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ addressIds = [], accountId: annotationAccountId }) {
    const pipeline = [
      { $match: { _id: { $in: addressIds } } },
      {
        $addFields: {
          id: "$_id",
          annotation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$accounts", []] },
                  as: "accountInfo",
                  cond: {
                    $eq: [
                      "$$accountInfo.id",
                      annotationAccountId || this.accountId
                    ]
                  }
                }
              },
              0
            ]
          }
        }
      },

      { $unwind: { path: "$accountInfo", preserveNullAndEmptyArrays: true } }
    ];

    const res = await Address.aggregate(pipeline);

    return res;
  }
});
