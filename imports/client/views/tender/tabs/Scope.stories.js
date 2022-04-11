import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ScopeTab from "./Scope.jsx";
import { GET_OWN_PRICELISTS_QUERY } from "/imports/client/components/forms/uniforms/SelectPriceListField.tsx";
import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/Scope"
};

const mocks = [
  {
    request: {
      query: GET_OWN_PRICELISTS_QUERY,
      variables: { input: { type: "contract" } }
    },
    result: {
      data: {
        priceLists: [
          {
            id: "jsBor6o3uRBTFoRQY",
            title: "b Test pricelist 1",
            carrierName: "test Carrier",
            type: "contract",
            status: "active"
          },
          {
            id: "jsBor6o3uRBTFoRQQ",
            title: "c Test pricelist 2",
            carrierName: "test Carrier",
            type: "contract",
            status: "draft"
          },
          {
            id: "jsBor6o3uRBTFoRQj",
            title: "a Test pricelist 3",
            carrierName: "test Carrier",
            type: "contract",
            status: "active"
          }
        ]
      }
    }
  }
];

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const tabOwner = () => {
  const props = { tender, security, onSave };

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageHolder main="Tender">
        <ScopeTab {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
