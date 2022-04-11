/**
 *
 * @param {Object} obj Object where we pick the keys from
 * @param  {...String} keyList comma separated list of keys that will be picked
 */

export const pick = (obj, ...keyList) => {
  return Object.entries(obj)
    .filter(([key]) => keyList.includes(key))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});
};
