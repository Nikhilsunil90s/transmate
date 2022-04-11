export const traverse = inObject => {
  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // not an object
  }

  const outObject = Array.isArray(inObject) ? [] : {};

  Object.keys(inObject).forEach(k => {
    let value = inObject[k];
    if (value !== null && typeof value === "object") {
      if (value.$date) {
        // converts date:
        value = new Date(value.$date);
      } else {
        value = traverse(value);
      }
    }
    outObject[k] = value;
  });

  return outObject;
};
