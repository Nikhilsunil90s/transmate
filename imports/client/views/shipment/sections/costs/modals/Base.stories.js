import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { Button } from "semantic-ui-react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentBaseCostModal from "./Base.jsx";

export default {
  title: "Shipment/modals/addBaseCost"
};

export const basic = () => (
  <MockedProvider mocks={[]}>
    <PageHolder main="Shipment">
      <ShipmentBaseCostModal onSave={console.log}>
        <Button content="Add base cost" />
      </ShipmentBaseCostModal>
    </PageHolder>
  </MockedProvider>
);
