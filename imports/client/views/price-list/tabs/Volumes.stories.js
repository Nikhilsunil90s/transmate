import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import VolumeTab from "./Volumes.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/volumes"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <VolumeTab {...props} />
    </PageHolder>
  );
};
