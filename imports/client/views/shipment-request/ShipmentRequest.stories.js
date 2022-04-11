import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { ShipmentRequest } from "./ShipmentRequest";
import { storyData } from "./utils/storyData";
import ShipmentReferences from "./components/ShipmentReferences";

export default {
  title: "Shipment/Request"
};

export const Basic = ({ ...props }) => {
  return (
    <PageHolder main="Request">
      <ShipmentRequest {...props} />
    </PageHolder>
  );
};

Basic.args = {
  link: [],
  onCreateShipment: () => {}
};

export const ReferenceStep = () => {
  const { shipment } = storyData;
  const shipmentId = shipment.id;
  return (
    <PageHolder main="Request">
      <ShipmentReferences shipment={shipment} shipmentId={shipmentId} />
    </PageHolder>
  );
};

export const SubmitSuccess = ({ ...props }) => {
  return (
    <PageHolder main="Request">
      <ShipmentRequest {...props} />
    </PageHolder>
  );
};

SubmitSuccess.args = {
  link: [],
  onCreateShipment: () => {},
  shipmentId: storyData.shipment.id,
  shipment: {
    ...storyData.shipment,
    request: {
      requestedOn: new Date(),
      by: "userId",
      accountId: "accountId",
      status: "submitted"
    }
  }
};
