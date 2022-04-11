import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import { Trans } from "react-i18next";

import NewInvoiceModal from "../modals/NewInvoice";

const PartnerOverviewFooter = () => {
  return (
    <>
      <CreateInvoiceButton />
    </>
  );
};

const CreateInvoiceButton = () => {
  const [show, showModal] = useState(false);
  return (
    <>
      <Button
        primary
        icon="circle add"
        content={<Trans i18nKey="invoice.add" />}
        onClick={() => showModal(true)}
      />
      <NewInvoiceModal {...{ show, showModal }} />
    </>
  );
};

export default PartnerOverviewFooter;
