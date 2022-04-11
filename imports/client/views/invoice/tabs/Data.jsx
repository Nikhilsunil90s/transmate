import React from "react";
import { DataSection, EmptyData } from "../sections";

const InvoiceDataTab = ({ ...props }) => {
  const { invoice = {} } = props;
  const isEmpty = !invoice.itemCount > 0;
  return <>{isEmpty ? <EmptyData {...props} /> : <DataSection {...props} />}</>;
};

export default InvoiceDataTab;
