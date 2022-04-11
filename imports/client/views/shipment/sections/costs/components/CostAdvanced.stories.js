import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentCostAdvanced from "./CostAdvanced.jsx";

export default {
  title: "Shipment/Segments/Costs/CostAdvanced"
};

const dummyProps = {
  shipment: {
    _id: "test",
    carrierIds: ["carrier1"],

    costParams: { entity: "TestEntity" },
    serviceLevel: "LCL"
  },
  onSave: console.log
};

export const basic = () => (
  <MockedProvider mocks={[]} addTypename={false}>
    <PageHolder main="Shipment">
      <ShipmentCostAdvanced {...dummyProps} />
    </PageHolder>{" "}
  </MockedProvider>
);
