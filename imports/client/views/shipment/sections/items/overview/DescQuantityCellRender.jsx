/* eslint-disable prettier/prettier */
import React from "react";

export const DescQuantityCellRender = params => {
  const { data, node } = params;
  if (!node.rowIndex) {
    return null;
  }
  const { description } = data;
  return <>{`${description == null ? "-" : description}`}</>;
};
