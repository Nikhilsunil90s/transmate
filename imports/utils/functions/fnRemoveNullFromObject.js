export const removeEmpty = (obj, removeTypename) => {
  const newObj = {};

  Object.keys(obj)
    .filter(key => !removeTypename || key !== "__typename")
    .forEach(key => {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map(item =>
          item && typeof item === "object"
            ? removeEmpty(item, removeTypename)
            : item
        ); // recurse array
      } else if (obj[key] && typeof obj[key] === "object") {
        newObj[key] = removeEmpty(obj[key], removeTypename); // recurse
      } else if (obj[key] != null) {
        newObj[key] = obj[key]; // copy value
      }
    });

  return newObj;
};
