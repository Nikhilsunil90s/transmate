import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentProjectsOverview from "./ShipmentProjectsOverview";
import { mocks } from "./utils/storyData";

export default {
  title: "Projects/Overview"
};

export const basic = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <PageHolder main="AccountPortal">
      <ShipmentProjectsOverview />
    </PageHolder>
  </MockedProvider>
);
