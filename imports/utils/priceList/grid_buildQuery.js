const debug = require("debug")("price-list:grid-buildQuery");

const buildGridQuery = ({ pageFilters = [], params = {} }) => {
  debug("build query pagefilters : %o  params : %o", pageFilters, params);
  const rules = {};
  pageFilters.forEach(el => {
    return Object.assign(rules, {
      [`${el.field}`]: el.value
    });
  });
  return rules;
};

export { buildGridQuery };
