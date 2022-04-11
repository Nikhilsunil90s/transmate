import { oPath } from "/imports/utils/functions/path.js";
import { uniqueItems } from "/imports/utils/functions/fnListHelpers.js";
import { PRICELIST_TEMPLATES } from "/imports/api/_jsonSchemas/enums/priceListTemplates";

const gridHelpers = {
  pluckKeys(rules, keys = {}) {
    Object.keys(keys).forEach(k => {
      rules.push({ [k]: keys[k] });
    });
  },
  pluckProps(props, ref = {}) {
    // we get in the value, look in keys if we have any of these...
    if (ref.fieldType === "attr") return;

    // need to assign to the props element itself !!
    Object.assign(
      props, // modifying props element itself
      {
        // option 1: we have a (predefined) charge field -> keep key fields of the charge
        ...(ref.field === "charge"
          ? (({
              costId,
              name,
              meta,
              min,
              max,
              type,
              multiplier,
              currency
            }) => ({
              costId,
              ...(costId ? { costId } : undefined),
              ...(name ? { name } : undefined),
              ...(meta ? { meta } : undefined),
              ...(min ? { min } : undefined),
              ...(max ? { max } : undefined),
              ...(type ? { type } : undefined),
              ...(multiplier ? { multiplier } : undefined),
              ...(currency ? { amount: { unit: currency } } : undefined)
            }))(ref)
          : undefined)
      },
      {
        ...(ref.field === "charge"
          ? { rulesUI: { chargeId: ref.id } }
          : undefined)
      },

      // multiplier from multiplier field:
      {
        ...(ref.field === "multiplier"
          ? { multiplier: ref.value || ref.defaultValue }
          : undefined)
      },

      // currency
      {
        ...(ref.field === "amount.unit"
          ? {
              amount: { unit: ref.value || ref.defaultValue }
            }
          : undefined)
      }
    );
  },
  defaultTabs(template) {
    return oPath(["tabs"], PRICELIST_TEMPLATES[template]);
  }
};

// called with a 'this' context:
// eslint-disable-next-line func-names
const getProps = function(cell) {
  let rules = [];
  const props = {};

  // scan for the property [multipliers, costId]
  // 1 scan each column/row element
  ["col", "row"].forEach(prop => {
    return (this[`grid${prop}s`] || []).forEach(curProp => {
      const val = curProp[cell[prop]];
      if (val) {
        gridHelpers.pluckKeys(rules, val.keys);
        gridHelpers.pluckProps(props, val);
      }
      return undefined;
    });
  });

  // 3 on page filter
  (this.pageFilters || []).forEach(val => {
    gridHelpers.pluckKeys(rules, val.keys);
    return gridHelpers.pluckProps(props, val);
  });
  rules = uniqueItems(rules);
  return { rules, props };
};

// eslint-disable-next-line func-names
const getKeysForCell = function({ row, col }) {
  // call with context this (=grid)
  // negative coordinate = header!
  return {
    ...(row > -1 ? this.gridrowsKeys[row] : {}),
    ...(col > -1 ? this.gridcolsKeys[col] : {})
  };
};

/** get rule keys, page keys and rulesUI for cell */
const getSelectorForCell = function getSelectorForCell({ row, col }) {
  // call with context this (=grid)
  // negative coordinate = header!
  const keys = getKeysForCell.call(this, { row, col });
  const pageKeys = (this.pageFilters || []).reduce((acc, curr) => {
    const accObj = {
      ...acc,
      ...curr.keys
    };
    return accObj;
  }, {});

  const selectorRules = {
    ...keys,
    ...pageKeys
  };
  delete selectorRules.label;
  const { chargeId, ...rules } = selectorRules;
  const selector = { rules };
  if (chargeId) {
    selector.rulesUI = { chargeId };
  }

  return { selector };
};

export { gridHelpers, getProps, getKeysForCell, getSelectorForCell };
