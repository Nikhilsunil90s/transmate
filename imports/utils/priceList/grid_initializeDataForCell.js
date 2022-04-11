import get from "lodash.get";
import { defaultValues } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_priceList.js";
import { getProps } from "./grid_helpers";

export const gridInitializeEmptyCell = function initCell({ row, col }) {
  const { rules, props } = getProps.bind(this)({ row, col }); // call with 'this' context
  const rateDetail = {
    ...defaultValues,
    ...props,
    priceListId: this.priceListId,
    rules, // should be array of obj
    meta: { source: "table" }
  };

  const ruleWithLaneId = (rateDetail.rules || []).find(
    o => o.laneId != null
  ) || { laneId: null };

  rateDetail.laneId = ruleWithLaneId.laneId;
  return rateDetail;
};

// eslint-disable-next-line func-names
export const gridInitializeRateDataForCell = function({ row, col }) {
  let rateDetail;
  const existing = get(this, ["base", row, col]);
  if (existing) {
    rateDetail = {
      ...existing,
      rules: existing.rules // reformatRulesToArray(existing.rules)
    };
  } else {
    const { rules, props } = getProps.bind(this)({ row, col }); // call with 'this' context

    rateDetail = {
      ...defaultValues,
      ...props,
      priceListId: this.priceListId,
      rules, // should be array of obj
      meta: { source: "table" }
    };

    const ruleWithLaneId = (rateDetail.rules || []).find(
      o => o.laneId != null
    ) || { laneId: null };

    rateDetail.laneId = ruleWithLaneId.laneId;
  }
  return { rateDetail };
};
