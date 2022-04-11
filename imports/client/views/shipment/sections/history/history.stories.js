import React from "react";
import moment from "moment";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "../../../../components/utilities/PageHolder";
import ShipmentHistory from "./History.jsx";
import { GET_USER_INFO } from "/imports/client/components/tags/UserTag";
import { GET_DOCUMENT } from "/imports/client/components/tags/DocumentTag";

export default {
  title: "Shipment/Segments/history"
};

const dummyProps = {
  shipment: {
    _id: "test",
    updates: [
      {
        action: "document",
        ts: moment()
          .subtract(1, "days")
          .toDate(),
        data: {
          id: "zwkjMazxgKBpWjHXE"
        },
        userId: "jsBor6o3uRBTFoRQY"
      }
    ]
  },
  onSave: () => {},
  security: {}
};

const mocks = [
  {
    request: {
      query: GET_USER_INFO,
      variables: { userId: "jsBor6o3uRBTFoRQY" }
    },
    result: {
      data: {
        user: { id: "jsBor6o3uRBTFoRQY", name: "Test User" }
      }
    }
  },
  {
    request: {
      query: GET_DOCUMENT,
      variables: { id: "zwkjMazxgKBpWjHXE" }
    },
    result: {
      data: {
        document: { id: "zwkjMazxgKBpWjHXE", url: "/some/url" }
      }
    }
  }
];

export const basic = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <PageHolder main="Shipment">
      <ShipmentHistory {...dummyProps} />
    </PageHolder>
  </MockedProvider>
);

export const empty = () => {
  dummyProps.shipment.updates = [];
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentHistory {...dummyProps} />
      </PageHolder>
    </MockedProvider>
  );
};
