export function displayKey(key) {
  if (!key || !key.replace) {
    return "";
  }

  // .replace "\\\\", "\\"
  return key.replace(/\\u0024/g, "$").replace(/\\u002e/g, ".");
}
