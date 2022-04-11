/* eslint-disable no-use-before-define */
import moment from "moment";
import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { Trans } from "react-i18next";

import InvoiceOverviewFooter from "./components/InvoiceOverviewFooter";
import { GET_INVOICE_OVERVIEW } from "./utils/queries";
import { PartnerTag } from "/imports/client/components/tags/PartnerTag";
import { StatusTag } from "/imports/client/components/tags";
import { currencyFormat } from "/imports/utils/UI/helpers";
import { STATUS_COLORS } from "/imports/api/_jsonSchemas/enums/invoice";
import { DEFAULT_CURRENCY } from "/imports/api/_jsonSchemas/enums/costs";
import useRoute from "../../router/useRoute";
import LoginContext from "../../context/loginContext";

const debug = require("debug")("invoice:overview");

function prepareView({ invoices, accountId }) {
  return invoices.map(doc => ({
    ...doc,
    partner: doc.clientId === accountId ? doc.seller : doc.client,
    invoiceDate: moment(doc.date).format("YYYY-MM-DD")
  }));
}

const InvoiceOverview = props => {
  const { accountId } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const { partnerId, status } = props.selector || {};
  const { data = {}, loading: isLoading, error } = useQuery(GET_INVOICE_OVERVIEW, {
    variables: { partnerId, status },
    fetchPolicy: "no-cache"
  });
  if (error) console.error(error);
  debug("query result %o", data);

  const invoices = prepareView({ invoices: data.invoices || [], accountId });

  const columns = [
    {
      Header: <Trans i18nKey="partner.overview.headers.partnerId" />,
      accessor: "partner",
      Cell: ({ value = {} }) => <PartnerTag name={value.name} accountId={value.id} />
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.invoice" />,
      accessor: "number"
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.date" />,
      accessor: "invoiceDate"
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.items" />,
      accessor: "itemCount"
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.total" />,
      accessor: "amount",
      Cell: ({ value }) =>
        value ? currencyFormat(value.value, value.currency) : currencyFormat(0, DEFAULT_CURRENCY)
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.invoiceStatus" />,
      accessor: "status",
      Cell: ({ value }) => <StatusTag text={value} color={STATUS_COLORS[value] || "grey"} />
    }
  ];

  function handleClicked(selectedRow) {
    debug({ selectedRow });
    if (!selectedRow) return;
    goRoute("invoice", { _id: selectedRow.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isLoading}
        paginationContent={<InvoiceOverviewFooter />}
        columns={columns}
        data={invoices}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default InvoiceOverview;
