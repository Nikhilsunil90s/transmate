import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import InvoiceGeneralTab from "./General.jsx";
import { dummyProps } from "../utils/storydata";

export default {
  title: "Invoice/tabs/general"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceRequest">
      <InvoiceGeneralTab {...{ invoice: props }} />
    </PageHolder>
  );
};
