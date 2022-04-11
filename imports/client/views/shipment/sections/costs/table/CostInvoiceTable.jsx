import React from "react";

import CostItemsTable from "./CostItemTable";

const CostInvoiceTable = ({ ...props }) => {
  const { invoices = [], baseCurrency, showHeader, ...baseProps } = props;

  return invoices.map((invoice, i) => (
    <CostItemsTable
      key={i}
      {...baseProps}
      costs={invoice.costItems || invoice.costs}
      baseCurrency={baseCurrency}
      context="invoice"
      showHeader={showHeader && i === 0}
    />
  ));
};

export default CostInvoiceTable;
