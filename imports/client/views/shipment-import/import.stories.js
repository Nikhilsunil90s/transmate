import React from "react";

import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentImport from "./Import.jsx";
import Aside from "./Aside.jsx";
import {
  MocksForStep1,
  MocksForStep2,
  MocksForStep3,
  MocksForStep4
} from "./utils/storyData";

export default {
  title: "Shipment/Import",
  decorators: [
    Story => (
      <div>
        <Story />
      </div>
    )
  ]
};

// file-upload == first step
// document progress.data = 0
export const fileUpload = () => {
  // set the dummy Flowrouter param:
  // FlowRouter.setParams({ _id: importId });
  return (
    <MockedProvider mocks={MocksForStep1} addTypename={false}>
      <PageHolder main="Import" aside={<Aside />}>
        <ShipmentImport />
      </PageHolder>
    </MockedProvider>
  );
};

// file-upload == first step
// document progress.data = 100
// document progress.jobs === 0
export const mapping = () => {
  // set the dummy Flowrouter param:
  // FlowRouter.setParams({ _id: importId });
  return (
    <MockedProvider mocks={MocksForStep2} addTypename={false}>
      <PageHolder main="Import" aside={<Aside />}>
        <ShipmentImport />
      </PageHolder>
    </MockedProvider>
  );
};

// file-upload == first step
// document progress.data = 100
// document progress.jobs === 100
// document total.shipments
export const wait = () => {
  // set the dummy Flowrouter param:
  // FlowRouter.setParams({ _id: importId });
  return (
    <MockedProvider mocks={MocksForStep3} addTypename={false}>
      <PageHolder main="Import" aside={<Aside />}>
        <ShipmentImport />
      </PageHolder>
    </MockedProvider>
  );
};

// file-upload == first step
// document progress.data = 100
// document progress.jobs === 100
// document total.shipments
// document total.jobs <> undefined
export const process = () => {
  // set the dummy Flowrouter param:
  // FlowRouter.setParams({ _id: importId });
  return (
    <MockedProvider mocks={MocksForStep4} addTypename={false}>
      <PageHolder main="Import" aside={<Aside />}>
        <ShipmentImport />
      </PageHolder>
    </MockedProvider>
  );
};
