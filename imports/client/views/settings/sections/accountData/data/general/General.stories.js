import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import MasterData, { CostsSettings } from "./General";
import { GET_GENERAL_SETTINGS } from "./queries";

export default {
  title: "Settings/general"
};

const mockData = {
  id: "accountId",
  tags: ["test1", "test2"],
  costs: [
    {
      id: "someId",
      type: "freight",
      group: "freight",
      cost: "freight cost",
      __typename: "CostType"
    },
    {
      id: "someId",
      type: "fuel",
      group: "additional",
      cost: "Fuel cost",
      __typename: "CostType"
    }
  ],
  __typename: "AccountSettings"
};

export const main = () => {
  const props = {
    onSave: console.log,
    refetch: () => {},
    security: {
      canEditProjects: true
    }
  };
  return (
    <MockedProvider
      mocks={[
        {
          request: { query: GET_GENERAL_SETTINGS },
          result: { accountSettings: mockData }
        }
      ]}
      addTypename={false}
    >
      <PageHolder main="Settings">
        <IconSegment
          title="general"
          icon="globe"
          body={<MasterData {...props} />}
        />
      </PageHolder>
    </MockedProvider>
  );
};

export const costs = () => {
  const props = {
    costs: mockData.costs,
    onSave: console.log
  };
  return <CostsSettings {...props} />;
};
