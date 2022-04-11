import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import EquipmentTab from "./Equipments.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/equipments"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <EquipmentTab {...props} />
    </PageHolder>
  );
};
