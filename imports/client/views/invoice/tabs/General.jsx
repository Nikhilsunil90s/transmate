import React from "react";
import { SummarySection, DocumentSection, InfoSection, EmptyData } from "../sections";

const InvoiceGeneralTab = ({ ...props }) => {
  const { invoice = {} } = props;
  const isEmpty = !invoice.itemCount > 0;
  return (
    <>
      <InfoSection {...props} />
      {isEmpty ? <EmptyData {...props} /> : <SummarySection {...props} />}
      <DocumentSection {...props} />
    </>
  );
};

export default InvoiceGeneralTab;
