import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { WildcardMockLink } from "wildcard-mock-link";

import ShipmentOverview from "./ShipmentOverview";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import {
  getPickingDetailMock,
  getPickingOverviewMock,
  getLocationInfo,
  printPickingList,
  cancelPackingLabel
} from "../utils/storybookData";
import { LoginProvider } from "/imports/client/context/loginContext";

export default {
  title: "Picking/Overview/page",
  decorators: [
    (Story, context) => {
      const { link } = context.args;
      const user = {
        preferences: {
          picking: {
            addressId: "j958tYA872PAogTDq"
          }
        }
      };

      return (
        <LoginProvider value={{ user }}>
          <MockedProvider link={link} addTypename={false}>
            <PageHolder main="ShipmentOverview">
              <Story />
            </PageHolder>
          </MockedProvider>
        </LoginProvider>
      );
    }
  ]
};

export const base = () => {
  return <ShipmentOverview />;
};

base.args = {
  link: new WildcardMockLink([
    getPickingOverviewMock,
    getPickingDetailMock,
    getLocationInfo,
    printPickingList,
    cancelPackingLabel
  ])
};
