import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { Button } from "semantic-ui-react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentAdditionalCostModal from "./Additional.jsx";

export default {
  title: "Shipment/modals/addAdditionalCost"
};

export const basic = () => (
  <MockedProvider mocks={[]}>
    <PageHolder main="Shipment">
      <ShipmentAdditionalCostModal onSave={console.log}>
        <Button content="Add cost" />
      </ShipmentAdditionalCostModal>
    </PageHolder>
  </MockedProvider>
);
