import React from "react";
import currencies from "iso-currencies";

const shortList = ["EUR", "USD", "GBP"];
const currencyMap = currencies.list();

export const currencyOpts = shortList; // Object.keys(currencyMap).filter;

export default ({ value: key }) => {
  const { symbol } = currencyMap[key] || {};
  return (
    <span>
      {key}
      {symbol && <span style={{ opacity: 0.3 }}>({symbol})</span>}
    </span>
  );
};
