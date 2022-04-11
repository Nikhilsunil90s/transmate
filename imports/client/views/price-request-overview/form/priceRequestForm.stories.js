import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import PriceRequestForm from "./PriceRequestForm";

export default {
  title: "PriceRequest/Form",
  decorators: [
    (Story, context) => {
      const { mocks, link } = context?.args || {};

      return (
        <MockedProvider mocks={mocks} link={link} addTypename={false}>
          <PageHolder main="PriceRequest">
            <Story />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

export const form = () => {
  return (
    <div>
      <PriceRequestForm />
    </div>
  );
};
