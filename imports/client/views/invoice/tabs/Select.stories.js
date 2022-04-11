import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { SelectShipments } from "../sections/SelectShipments.jsx";

import { availebleShipments } from "../utils/storydata";

export default {
  title: "Invoice/tabs/select"
};

export const basic = () => {
  const props = {
    shipments: availebleShipments,
    loading: false
  };

  return (
    <PageHolder main="PriceRequest">
      <SelectShipments {...props} />
    </PageHolder>
  );
};
