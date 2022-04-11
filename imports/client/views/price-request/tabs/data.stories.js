import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestDataTab from "./Data.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Tabs/data"
};

export const basic = () => {
  const props = { ...dummyProps };
  props.setActiveShipmentId = () => {};
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestDataTab {...props} />
    </PageHolder>
  );
};
