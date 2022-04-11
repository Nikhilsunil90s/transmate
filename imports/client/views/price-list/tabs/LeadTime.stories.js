import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import LeadTimeTab from "./LeadTime.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/leadTimes"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <LeadTimeTab {...props} />
    </PageHolder>
  );
};
