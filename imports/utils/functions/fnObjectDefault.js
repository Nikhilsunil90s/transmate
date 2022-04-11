// filters out the undefined & null keys from an object (hence the == iso ===):

export const objDefault = obj => {
  Object.keys(obj).forEach(key => obj[key] == null && delete obj[key]);
  return obj;
};
