import React from "react";

export const QuantityCellRender = params => {
  const { data, node } = params;
  if (!node.rowIndex) {
    return null;
  }
  const { quantity = {} } = data;
  const { amount = 0, code } = quantity;

  return <>{`${amount} ${code}`}</>;
};
