import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { ChangesOverview } from "./Changes.jsx";
import data from "./changes-test-data.json";
import { GET_SHIPMENT_CHANGES } from "./changes.queries";
import { GET_USER_INFO } from "/imports/client/components/tags/UserTag";

export default {
  title: "Components/changesOverview"
};

const dummyProps = {
  id: "2jG2mZFcaFzqaThcr",
  changes: [],
  canEdit: true,
  loading: false,
  refetch: () => {}
};

const mocks = [
  {
    request: {
      query: GET_SHIPMENT_CHANGES,
      variables: { shipmentId: "2jG2mZFcaFzqaThcr" }
    },
    result: {
      data: { shipment: data }
    }
  },
  {
    request: {
      query: GET_USER_INFO,
      variables: { userId: "dH842ByGTEvhLmRxY" }
    },
    result: {
      data: { user: { id: "dH842ByGTEvhLmRxY", name: "demoUser" } }
    }
  }
];
export const basis = () => {
  // data contains shipemnt id and changes array key
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageHolder main="ShipmentPage">
        <ChangesOverview {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
