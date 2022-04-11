import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import MapSection from "./Map.jsx";

import { shipment, security } from "../../utils/storyData";

export default {
  title: "Shipment/segments/map"
};

const refetch = () => {};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const mapRoad = () => {
  const props = {
    shipment,
    shipmentId: shipment.id,
    security,
    onSave,
    refetch
  };

  props.shipment.type = "road";

  return (
    <PageHolder name="Shipment">
      <MapSection {...props} />
    </PageHolder>
  );
};

export const mapOcean = () => {
  const props = {
    shipment,
    shipmentId: shipment.id,
    security,
    onSave,
    refetch
  };

  props.shipment.type = "ocean";

  return (
    <PageHolder name="Shipment">
      <MapSection {...props} />
    </PageHolder>
  );
};
