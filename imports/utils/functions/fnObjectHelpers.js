import get from "lodash.get";

// helper to convert to dot notation
export const dotObject = function dotObj(obj) {
  const res = {};
  const recurse = (obj, current) => {
    Object.entries(obj).forEach(([k, val]) => {
      const newKey = current ? `${current}.${k}` : k; // joined key with dot
      if (val && typeof val === "object") {
        recurse(val, newKey); // it's a nested object, so do it again
      } else {
        res[newKey] = val; // it's not an object, so set the property'
      }
    });

    return res;
  };
  return recurse(obj);
};

// array to object
export const arrayToObject = arr => {
  return { ...arr };
};

// object to array
export const objectToArray = obj => {
  return Object.values(obj);
};

// find key value in object & get key
export const findKVInObject = (obj, sObj) => {
  const keyRef = Object.keys(sObj);
  const sKey = keyRef != null ? keyRef[0] : undefined;
  // eslint-disable-next-line consistent-return
  Object.entries(obj).forEach(([k, v]) => {
    if (v[sKey] === sObj[sKey]) {
      return {
        value: v,
        key: k
      };
    }
  });
};

// lookup a value in an object (deep)
// we use some as this returns once a hit is found...
export const findInObject = (obj, key) => {
  let value;
  value = undefined;

  // eslint-disable-next-line consistent-return, array-callback-return
  Object.keys(obj).some(k => {
    value = get(obj[k], key);
    if (value) return true;
    if (obj[k] && typeof obj[k] === "object") {
      value = findInObject(obj[k], key);
      return value !== undefined;
    }
  });

  return value;
};

export const cleanObject = obj => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
};

// filter object based on filter value:
export const filterObject = (obj, val) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === val) {
      delete obj[key];
    }
  });
  return obj;
};

export const isObject = obj => obj === Object(obj);
