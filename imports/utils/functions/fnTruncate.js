export const truncate = (str, n) => {
  if (typeof str === "string")
    return str.length > n ? `${str.substr(0, n - 1)}...` : str;
  return "";
};
