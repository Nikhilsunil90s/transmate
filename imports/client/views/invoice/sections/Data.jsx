import React, { useState } from "react";
import { Trans } from "react-i18next";
import { ReactTable } from "/imports/client/components/tables";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { tabPropTypes } from "../utils/_tabProptypes";
import { ItemActions, ItemFilter, ItemWarnings } from "../components";

import { FILTERS, applyFilters } from "../utils/dataFilters";
import { currencyFormat } from "/imports/utils/UI/helpers";
import DataDetailModal from "../modals/DataDetail";

//#region components
export const setHeader = column => {
  return <Trans i18nKey={`partner.billing.invoice.shipment.${column}`} />;
};

const DataOverview = ({ invoice, data = [], currency }) => {
  const [modalState, setModalState] = useState({ show: false });
  function showModal(visible) {
    setModalState({ ...modalState, show: visible });
  }
  function handleClicked(selectedRow) {
    if (!selectedRow) return;
    setModalState({
      show: true,
      showModal,
      shipmentId: selectedRow.shipmentId,
      invoiceId: invoice.id
    });
  }

  const columns = [
    {
      Header: () => setHeader("number"),
      accessor: "number"
    },
    {
      Header: () => setHeader("invoiced"),
      accessor: "invoice.total",
      Cell: ({ value }) => currencyFormat(value, currency)
    },
    {
      Header: () => setHeader("lookup.base"),
      accessor: "calculated.base",
      Cell: ({ value }) => currencyFormat(value, currency)
    },
    {
      Header: () => setHeader("lookup.fuel"),
      accessor: "calculated.fuel",
      Cell: ({ value }) => currencyFormat(value, currency)
    },
    {
      Header: () => setHeader("lookup.additional"),
      accessor: "calculated.additional",
      Cell: ({ value }) => currencyFormat(value, currency)
    },
    {
      Header: () => setHeader("lookup.total"),
      accessor: "calculated.total",
      Cell: ({ value }) => currencyFormat(value, currency)
    },
    {
      Header: () => setHeader("delta"),
      accessor: "delta",
      Cell: ({ value }) => currencyFormat(value, currency),
      orderable: true
    },
    {
      Header: "",
      id: "warnings",
      Cell: ({ row: { original } }) => <ItemWarnings invoiceItem={original} />
    }
  ];

  return (
    <>
      <ReactTable
        columns={columns}
        data={data}
        paginate
        maxRows={10}
        shouldShowTablePagination
        onRowClicked={handleClicked}
      />
      <DataDetailModal {...modalState} />
    </>
  );
};
//#endregion

const InvoiceDataSection = ({ ...props }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(FILTERS);
  const {
    invoiceId,
    invoice: { shipments = [], invoiceCurrency },
    onSelectTab
  } = props;

  const toggleFilters = () => setShowFilters(!showFilters);

  const data = shipments.filter(row => applyFilters({ data: row, filters }));
  const setFilter = ({ key, on }) => setFilters({ ...filters, [key]: on });

  return (
    <IconSegment
      title={<Trans i18nKey="partner.billing.invoice.details.title" />}
      icon="inbox"
      body={
        shipments.length ? (
          <>
            <ItemActions {...{ invoiceId, toggleFilters, onSelectTab }} />
            <ItemFilter show={showFilters} filters={filters} setFilter={setFilter} />
            <DataOverview {...props} data={data} currency={invoiceCurrency} />
          </>
        ) : (
          <div className="empty">
            <Trans i18nKey="partner.billing.invoice.documents.empty" />
          </div>
        )
      }
    />
  );
};

InvoiceDataSection.propTypes = tabPropTypes;

export default InvoiceDataSection;
