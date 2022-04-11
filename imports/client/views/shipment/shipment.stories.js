import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import { ShipmentPage } from "./Shipment.jsx";

import { shipment, security } from "./utils/storyData";

export default {
  title: "Shipment/page"
};

const dummyProps = {
  shipment,
  shipmentId: shipment.id,
  security,
  refetch: () => {},
  onSave: (update, cb) => {
    console.log({ update });
    if (typeof cb === "function") cb();
  }
};

export const page = () => {
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentPage {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
