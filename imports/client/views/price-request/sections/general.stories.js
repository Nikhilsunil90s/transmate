import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestGeneral from "./General.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/general"
};

export const basic = () => {
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestGeneral {...dummyProps} />
    </PageHolder>
  );
};

export const noBidPossible = () => {
  const dummyPropsNoBid = { ...dummyProps };

  // disable something..

  return (
    <PageHolder main="PriceRequest">
      <PriceRequestGeneral {...dummyPropsNoBid} />
    </PageHolder>
  );
};
