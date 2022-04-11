// type Props {
//   partnerIdField: string;
//   accountId:string;
//   asField: string;
//   fields: JSONObject
// }

/** reusable pipeline component that allows you to get partner information and annotation */
export const getAccountInfo = ({
  partnerIdField,
  accountId = "$accountId",
  asField,
  fields = {}
}) => {
  return [
    {
      $lookup: {
        from: "accounts",
        let: {
          partnerId: partnerIdField,
          accountId
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$partnerId"] } } },
          {
            $project: {
              id: "$_id",
              name: 1,
              type: 1,
              annotation: {
                $arrayElemAt: [
                  {
                    $ifNull: [
                      {
                        $filter: {
                          input: "$accounts",
                          as: "annotations",
                          cond: {
                            $eq: ["$$annotations.accountId", "$$accountId"]
                          }
                        }
                      },
                      []
                    ]
                  },
                  0
                ]
              },
              ...fields
            }
          }
        ],
        as: asField
      }
    },
    { $unwind: { path: `$${asField}`, preserveNullAndEmptyArrays: true } }
  ];
};
