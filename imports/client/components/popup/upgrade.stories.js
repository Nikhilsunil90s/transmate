import React from "react";
import { Button } from "semantic-ui-react";
import { MockedProvider } from "@apollo/client/testing";
import UpgradePopup, { REQUEST_UPGRADE } from "./Upgrade.jsx";

export default {
  title: "Components/upgrade"
};

const mocks = [
  {
    request: {
      query: REQUEST_UPGRADE,
      variables: { reference: "price.list" }
    },
    result: {
      data: { upgradeRequest: true }
    }
  }
];

export const simple = () => {
  return (
    <div style={{ marginTop: "150px" }}>
      <MockedProvider addTypename={false} mocks={mocks}>
        <UpgradePopup
          trigger={<Button content="test upgrade" />}
          reference="price.list"
        />
      </MockedProvider>
    </div>
  );
};
