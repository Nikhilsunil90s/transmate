import get from "lodash.get";
import { gridHelpers } from "/imports/utils/priceList/grid_helpers.js";

// all possible tabs:
// general
// conversions xx
// equipments
// fuel
// lanes
// leadTimes
// Logic xx
// notes
// rates
// ratesList
// volumes

export const initializeTabs = ({ priceList }) => {
  const templ = get(priceList, ["template", "type"]);
  const tabs = [
    "general",
    ...(get(priceList, ["template", "structure", "tabs"]) ||
      gridHelpers.defaultTabs(templ) || ["notes"])
  ].filter(tab => !["logic"].includes(tab));
  return tabs;
};
