import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import GeneralTab from "./General.jsx";

import { dummyProps } from "../utils/storydata";
import { PriceListSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list";

export default {
  title: "PriceList/Tabs/general"
};

export const basicNew = () => {
  const barePriceList = PriceListSchema.clean({});
  const props = { priceList: barePriceList, security: dummyProps.security };

  return (
    <PageHolder main="PriceList">
      <GeneralTab {...props} />
    </PageHolder>
  );
};

export const existingEdit = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <GeneralTab {...props} />
    </PageHolder>
  );
};

export const existingReadOnly = () => {
  const props = {
    ...dummyProps,
    security: { ...dummyProps.security, canEdit: false }
  };

  return (
    <PageHolder main="PriceList">
      <GeneralTab {...props} />
    </PageHolder>
  );
};
