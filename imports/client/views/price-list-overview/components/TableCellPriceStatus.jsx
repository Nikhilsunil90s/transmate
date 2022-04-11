import React from "react";
import { getPriceListStatus } from "./priceListStatus";

const TableCellPriceStatus = ({ priceList }) => {
  const { status, color } = getPriceListStatus(priceList);

  return (
    <>
      <span
        style={{ position: "relative", top: "2px" }}
        className={`ui ${color} empty horizontal circular label`}
      />
      {status}
    </>
  );
};

export default TableCellPriceStatus;
