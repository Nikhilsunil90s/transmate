import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { ShipmentDocumentsSection } from "./Documents.jsx";

import { dummyProps } from "./utils/storyData";

export default {
  title: "Shipment/Segments/documents"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentDocumentsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
