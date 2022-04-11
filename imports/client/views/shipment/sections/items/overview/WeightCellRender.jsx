/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
import React from "react";

export const WeightCellRender = params => {
  const { data, node } = params;
  if (!node.rowIndex) {
    return null;
  }
  const { weight_net, weight_gross, weight_unit } = data;

  return (
    <>{`(${weight_net == null ? "-" : weight_net}) ${weight_gross == null ? "-" : weight_gross} ${
      weight_unit == null ? "-" : weight_unit
    }`}</>
  );
};
