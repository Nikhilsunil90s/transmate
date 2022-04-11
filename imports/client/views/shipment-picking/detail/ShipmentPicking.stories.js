import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { WildcardMockLink } from "wildcard-mock-link";

import ShipmentPickingContainer from "./ShipmentPickingContainer";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import {
  getPickingDetailMock,
  getPickingDetailMock2,
  getLabelOptionsMock,
  confirmShipmentLabelOption,
  unPackAllShipments,
  cancelPackingLabel,
  packShipmentItemsMock
} from "../utils/storybookData";

export default {
  title: "Picking/Detail/page",
  decorators: [
    (Story, context) => {
      const { link } = context.args;

      return (
        <MockedProvider link={link} addTypename={false}>
          <PageHolder main="ShipmentPicking">
            <Story />
          </PageHolder>
        </MockedProvider>
      );
    }
  ]
};

export const base = () => {
  return <ShipmentPickingContainer />;
};

base.args = {
  link: new WildcardMockLink([
    getPickingDetailMock,
    getLabelOptionsMock,
    confirmShipmentLabelOption,
    unPackAllShipments,
    cancelPackingLabel,
    packShipmentItemsMock
  ]),
  router: { pathName: "/pack/12456", pathAlias: "/pack/:_id" }
};

export const someItemsPicked = () => {
  // FlowRouter.setParams({ _id: "2jG2mZFcaFzqaThcr" });

  return <ShipmentPickingContainer />;
};

someItemsPicked.args = { mocks: [getPickingDetailMock2] };

export const withNoButtons = () => {
  // FlowRouter.setParams({ _id: "2jG2mZFcaFzqaThcr" });

  return <ShipmentPickingContainer withButtons={false} />;
};

withNoButtons.args = {
  link: new WildcardMockLink([getPickingDetailMock])
};
