import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestRequirements from "./Requirements.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/requirements"
};

export const basic = () => {
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestRequirements {...dummyProps} />
    </PageHolder>
  );
};
