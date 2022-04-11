import { Address } from "/imports/api/addresses/Address";

export const getAddress = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ addressId, accountId: annotationAccountId }) {
    const pipeline = [
      { $match: { _id: addressId } },
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
      }
    ];

    const res = await Address.aggregate(pipeline);

    return res[0];
  }
});
