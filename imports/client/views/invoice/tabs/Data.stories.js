import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import InvoiceDataTab from "./Data.jsx";
import { dummyProps } from "../utils/storydata";

export default {
  title: "Invoice/tabs/data"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceRequest">
      <InvoiceDataTab {...{ invoice: props }} />
    </PageHolder>
  );
};
