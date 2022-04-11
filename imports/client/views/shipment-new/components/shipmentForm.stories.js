import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentForm from "./ShipmentForm";
import { link } from "./storyData";

export default {
  title: "Shipment/new",
  decorators: [
    (Story, context) => {
      const { mocks, ...args } = context.args || {};
      return (
        <MockedProvider link={link} addTypename={false}>
          <PageHolder main="NewShipment">
            <Story {...args} />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

export const form = () => {
  return <ShipmentForm />;
};

form.args = {};
