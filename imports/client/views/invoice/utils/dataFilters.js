export const FILTERS = {
  withCosts: false,
  withoutCosts: false,
  largeDelta: false
};

const DELTA_HIGH = 50;
const DELTA_LOW = -50;

/** applied in filter function
 * @param {Object}data
 * @param {Object} fitlers
 */
export const applyFilters = ({ data, filters }) => {
  let condition = true;
  if (filters.withCosts) condition = condition && data.hasCosts;
  if (filters.withoutCosts) condition = condition && !data.hasCosts;
  if (filters.largeDelta)
    condition = condition && data.delta > DELTA_HIGH && data.delta < DELTA_LOW;

  return condition;
};
