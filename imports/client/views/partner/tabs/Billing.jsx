import React, { useState } from "react";
import moment from "moment";
import { Trans } from "react-i18next";
import { ReactTable } from "/imports/client/components/tables";
import CurrencyTag from "/imports/client/components/tags/CurrencyTag";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { Button } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import { GET_INVOICES } from "../utils/queries";
import NewInvoiceModal from "/imports/client/views/invoice-overview/modals/NewInvoice.jsx";
import useRoute from "/imports/client/router/useRoute";

const InvoiceList = ({ ...props }) => {
  const { partnerId } = props;
  const { goRoute } = useRoute();
  const { data = {}, loading, error } = useQuery(GET_INVOICES, {
    variables: { partnerId }
  });

  if (error) console.error(error);
  const invoices = data.invoices || [];

  const handleClicked = ({ id }) => goRoute("invoice", { _id: id });

  return (
    <ReactTable
      isLoading={loading}
      data={invoices}
      onRowClicked={handleClicked}
      emptyTableMsg={<Trans i18nKey="partner.billing.invoices.empty" />}
      columns={[
        { Header: () => <Trans i18nKey="partner.billing.invoice.number" />, accessor: "number" },
        {
          Header: () => <Trans i18nKey="partner.billing.invoice.date" />,
          accessor: "date",
          Cell: ({ value }) => moment(value).format("DD/MM/YYYY")
        },
        {
          Header: () => <Trans i18nKey="partner.billing.invoice.amount" />,
          accessor: "amount",
          Cell: ({ value: amount }) => (
            <CurrencyTag value={amount?.value || 0} currency={amount?.currency} />
          )
        },
        {
          Header: () => <Trans i18nKey="partner.billing.invoice.delta" />,
          accessor: "delta",
          Cell: ({ value: delta }) =>
            delta?.value ? <CurrencyTag value={delta.value} currency={delta.currency} /> : " - "
        },
        { Header: () => null, id: "actions" }
      ]}
    />
  );
};

const PartnerBilling = ({ ...props }) => {
  const { partnerId } = props;
  const [show, showModal] = useState(false);
  return (
    <IconSegment
      name="billing"
      icon="payment"
      title={<Trans i18nKey="partner.billing.title" />}
      body={<InvoiceList {...props} />}
      footer={
        <div>
          <Button
            primary
            icon="plus"
            content={<Trans i18nKey="partner.billing.invoices.add" />}
            onClick={() => showModal(true)}
          />
          <NewInvoiceModal {...{ show, showModal, partnerId }} />
        </div>
      }
    />
  );
};

export default PartnerBilling;
