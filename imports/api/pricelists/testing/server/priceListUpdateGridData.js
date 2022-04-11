import pick from "lodash.pick";
import { Random } from "/imports/utils/functions/random.js";

/** generates testing data for grid update
 * @param {{priceListId: string, count?: number}} param0
 * @returns {{priceListId: string, updates: any[]}}
 */
export const generateGridupdateInputData = ({ priceListId, count = 2 }) => {
  return {
    priceListId,
    updates: Array(count)
      .fill(null)
      .map(() => {
        const laneId = Random.id(6);
        const volumeGroupId = Random.id(6);
        const volumeRangeId = Random.id(6);
        return {
          selector: {
            rules: {
              laneId,
              volumeGroupId,
              volumeRangeId
            }
          },
          update: {
            id: Random.id(), // should be ignored in the update
            priceListId,
            costId: "o6fLThAWhaWW3uDaj",
            type: "calculated",
            name: "Base rate",
            amount: { value: 10000 },
            multiplier: "shipment",
            rules: [{ laneId }, { volumeGroupId }, { volumeRangeId }],
            comment: "Base rate",
            meta: { source: "table" },
            fieldType: "rate"
          }
        };
      })
  };
};

export const generateGridupdateInputDataForExisting = ({ rate = {} }) => {
  const { priceListId } = rate;

  return {
    priceListId,
    updates: [
      {
        selector: {
          rules: (rate.rules || []).reduce((acc, cur) => {
            Object.entries(cur).forEach(([k, v]) => {
              acc[k] = v;
            });
            return acc;
          }, {})
        },
        update: {
          ...pick(rate, [
            "id",
            "priceListId",
            "costId",
            "type",
            "name",
            "amount",
            "multiplier",
            "rules",
            "comment",
            "meta",
            "fieldType"
          ]),
          amount: { value: 10000, unit: "USD" }
        }
      }
    ]
  };
};
