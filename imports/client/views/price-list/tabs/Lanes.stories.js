import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import LanesTab from "./Lanes.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/lanes"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <LanesTab {...props} />
    </PageHolder>
  );
};
