import { Review } from "../Review";

// returns {personal: [], global: []};

// group by category
const scoreCalculation = [
  {
    $group: {
      _id: {
        id: "$_id",
        weight: { $ifNull: ["$shipmentsCount", 1] },
        category: "$score.category"
      },
      score: { $avg: "$score.score" }
    }
  },
  {
    $group: {
      _id: "$_id.category",
      scoreBase: {
        $sum: {
          $multiply: ["$score", "$_id.weight"]
        }
      },
      weight: {
        $sum: "$_id.weight"
      }
    }
  },
  {
    $project: {
      _id: 0,
      category: "$_id",
      count: "$weight",
      score: {
        $divide: ["$scoreBase", "$weight"]
      }
    }
  }
];

export const getScoring = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ partnerId }) {
    const pipeline = [
      { $match: { subjectId: partnerId } },
      { $unwind: { path: "$score" } },
      {
        $facet: {
          personal: [{ reviewerId: this.accountId }, ...scoreCalculation],
          global: [...scoreCalculation]
        }
      }
    ];

    const score = await Review._collection.aggregate(pipeline);
    return score
      .map(item => ({
        // label: oldTAPi18n.__(`partner.review.${item.category}.title`),
        rating: Math.round(item.score),
        value: item.score.toFixed(2),

        // distance: me.distance
        count: item.count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
});
