import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { InvoiceMappingSection } from "../sections/Mapping.jsx";
import { dummyMapping, costOptions } from "../utils/storydata";

export default {
  title: "Invoice/tabs/mapping"
};

export const basic = () => {
  const props = {
    mapping: dummyMapping,
    canEdit: true,
    costOptions
  };

  return (
    <PageHolder main="PriceRequest">
      <InvoiceMappingSection {...props} />
    </PageHolder>
  );
};

export const disabled = () => {
  const props = {
    mapping: dummyMapping,
    canEdit: false,
    costOptions
  };

  return (
    <PageHolder main="PriceRequest">
      <InvoiceMappingSection {...props} />
    </PageHolder>
  );
};
