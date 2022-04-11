export function startCase(str) {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function toOptionList(array, noCaseModifier) {
  return (array || []).map(key => ({
    key,
    value: key,
    text: noCaseModifier ? key : startCase(key)
  }));
}
