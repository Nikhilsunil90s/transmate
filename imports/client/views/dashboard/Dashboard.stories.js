import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import Dashboard from "./Dashboard.jsx";
import { GET_DASHBOARD_DATA } from "./utils/queries";
import { taskMocks } from "./utils/storyData";

export default {
  title: "Dashboard"
};

const mocks = [
  {
    request: {
      query: GET_DASHBOARD_DATA
    },
    result: {
      data: {
        stats: {
          addressLocations: [
            {
              name: "test",
              location: {
                lat: 1.123,
                lng: 0.85,
                __typename: "LatLngType"
              },
              __typename: "DashboardLocationdata"
            }
          ],
          priceListCount: 20,
          priceRequestCount: 10,
          invoiceCount: 15,
          shipmentCount: {
            planned: 100,
            completed: 20,
            started: 14,
            draft: 200,
            __typename: "ShipmentCountType"
          },
          tenderCount: 1,
          __typename: "DashboardData"
        }
      }
    }
  },
  {
    request: {
      query: GET_DASHBOARD_DATA
    },
    result: {
      data: {
        tasks: taskMocks
      }
    }
  }
];

export const main = () => {
  const props = {};
  console.log("test");
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageHolder main="Dashboard">
        <Dashboard {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
