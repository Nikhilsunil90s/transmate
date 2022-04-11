import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "../../components/utilities/PageHolder";
import { PriceListPage } from "./PriceList.jsx";
import { PriceListAside } from "./Aside.jsx";

import { dummyProps } from "./utils/storydata";

const { priceList, security, ...rest } = dummyProps;

export default {
  title: "PriceList/page"
};

export const basic = () => {
  const props = { priceList, security, ...rest };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="PriceList">
        <PriceListPage {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const fillOut = () => {
  const props = {
    priceList,
    security: {
      ...security,
      canEdit: false,
      canModifyGridStructure: false,
      canAddFuelModel: false,
      canModifyLeadTime: false,
      canAddMasterNotes: false,
      canBeReleased: true,
      canBeApproved: false,
      canBeSetBackToDraft: false,
      canBeDeactivated: false,
      canBeArchived: false,
      canBeActivated: false,
      canBeDeleted: false,

      canEditRateInGrid: true,
      canEditCurrencyInGrid: true,
      canEditMultiplierInGrid: true,
      canEditLaneInGrid: true,
      canEditEquipmentInGrid: true,
      canEditVolumesInGrid: true,
      canEditCharge: false,
      canAddGridComments: false,
      canFillOut: true,
      canEditRateInList: true
    },
    ...rest
  };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="PriceList">
        <PriceListPage {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const aside = () => {
  const accountId = "";
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PriceListAside priceList={priceList} accountId={accountId} />
    </MockedProvider>
  );
};
