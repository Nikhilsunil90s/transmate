import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { InvoicePage } from "./Invoice.jsx";
import { dummyProps } from "./utils/storydata";

export default {
  title: "Invoice/page"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceRequest">
      <InvoicePage {...{ invoice: props }} />
    </PageHolder>
  );
};
