import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import ShipmentLinks from "./ShipmentLinks.jsx";

export default {
  title: "Shipment/Segments/links"
};

const dummyProps = {
  shipment: {
    _id: "test",
    links: [
      {
        id: "testInboundId",
        type: "projectInbound",
        urlBase: "shipment-project"
      },
      {
        id: "testOutboundId",
        type: "projectOutbound",
        urlBase: "shipment-project"
      }
    ]
  },
  onSaveAction: () => {}
};

export const basic = () => (
  <PageHolder main="Shipment">
    <ShipmentLinks {...dummyProps} />
  </PageHolder>
);

export const empty = () => {
  dummyProps.shipment.links = [];
  return (
    <PageHolder main="Shipment">
      <ShipmentLinks {...dummyProps} />
    </PageHolder>
  );
};
