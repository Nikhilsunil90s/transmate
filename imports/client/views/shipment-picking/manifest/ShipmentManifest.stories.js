import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { WildcardMockLink } from "wildcard-mock-link";

import ShipmentManifest from "./ShipmentManifest";
import ManifestPrintout from "./components/ManifestPrintout";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import {
  getManifestMock,
  printPickingManifestMock,
  printPickingManifestResponse
} from "../utils/storybookData";
import { LoginProvider } from "/imports/client/context/loginContext";

export default {
  title: "Picking/Manifest/page",
  decorators: [
    (Story, context) => {
      const { mocks, link } = context.args;
      const user = {
        preferences: {
          picking: {
            addressId: "j958tYA872PAogTDq"
          }
        }
      };

      return (
        <LoginProvider value={{ user }}>
          <MockedProvider mocks={mocks} link={link} addTypename={false}>
            <PageHolder main="ShipmentManifest">
              <Story />
            </PageHolder>
          </MockedProvider>
        </LoginProvider>
      );
    }
  ]
};

export const base = () => {
  return <ShipmentManifest />;
};

base.args = {
  link: new WildcardMockLink([getManifestMock, printPickingManifestMock])
};

// is rendered on print:
export const manifestPrintout = () => {
  return <ManifestPrintout shipments={printPickingManifestResponse} />;
};
