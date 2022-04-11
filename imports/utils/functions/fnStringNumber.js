export const unformatNumberStr = val => {
  let convValue = val;
  if (typeof val === "string") {
    convValue = convValue.trim();
    const separators = [...convValue.replace(/\d/gi, "")];
    for (let i = 0; i < separators.length - 1; i += 1) {
      convValue = convValue.replace(separators[i], "");
    }

    if (separators) {
      convValue = convValue.replace(separators.slice(-1).pop(), ".");
    }
  }
  return convValue;
};
