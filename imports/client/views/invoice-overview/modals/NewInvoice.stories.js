/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";

import { Button } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import NewInvoiceModal, { NewInvoiceForm } from "./NewInvoice.jsx";

export default {
  title: "Invoice/modals/new"
};

export const formAsShipper = () => {
  const props = {
    onSubmitForm() {},
    partnerId: undefined
  };

  return (
    <PageHolder main="PriceRequest">
      <NewInvoiceForm {...props} />
    </PageHolder>
  );
};

export const formAsCarrier = () => {
  const props = {
    onSubmitForm() {},
    partnerId: undefined,
    accountType: "carrier" // tested using the AllAccounts.getType();
  };

  return (
    <PageHolder main="PriceRequest">
      <NewInvoiceForm {...props} />
    </PageHolder>
  );
};

export const modal = () => {
  const [show, showModal] = useState(false);

  return (
    <PageHolder main="PriceRequest">
      <Button content="show" onClick={() => showModal(true)} />
      <NewInvoiceModal {...{ show, showModal }} />
    </PageHolder>
  );
};
