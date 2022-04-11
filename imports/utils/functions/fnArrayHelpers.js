export const setIsSubset = ({ subsetArr, masterArr }) => {
  return subsetArr.every(val => masterArr.includes(val));
};

/** arraydiff
 * @params {{masterArr: [String], subsetArr: [String]}}
 * @returns [String] array of items in A not in B
 */
export const arraydiff = ({ masterArr, subsetArr }) => {
  return subsetArr.filter(a => {
    return masterArr.indexOf(a) === -1;
  });
};

export const arrayUnique = (array, key) => {
  const result = [];
  const map = new Map();
  // eslint-disable-next-line no-restricted-syntax
  for (const item of array) {
    if (!map.has(item[key])) {
      map.set(item[key], true); // set any value to Map
      result.push(item);
    }
  }
  return result;
};

export const addToSetArray = (array = [], itemToAdd) => {
  const set = new Set([...array]);

  set.add(itemToAdd);
  return [...set];
};

export const pullFromArray = (array = [], itemToRemove) => {
  return array.filter(item => item !== itemToRemove);
};
