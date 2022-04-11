import React from "react";
import get from "lodash.get";
import { DisplayMapClass } from "/imports/client/components/maps/HereMap";

const debug = require("debug")("shipment:map");

const Map = ({ ...props }) => {
  const { shipment } = props;
  const { pickup, delivery } = shipment;
  const markers = [pickup.location, delivery.location].map((stop, i) => ({
    coords: stop.latLng,
    color: i === 0 ? "green" : "blue",
    title: stop.name
  }));
  debug("markers %o", markers);

  // route plot
  const route = {
    road: shipment.type === "road"
  };

  return <DisplayMapClass {...{ height: 300, markers, mapType: "truck", maxZoom: 10, route }} />;
};

const ShipmentMapSection = ({ ...props }) => {
  const { shipment } = props;
  const showMap =
    !!get(shipment, ["pickup", "location", "latLng"]) &&
    !!get(shipment, ["delivery", "location", "latLng"]) &&
    Meteor.settings.public.HERE_KEY;

  debug("can we show a map? %o", showMap);

  return showMap ? (
    <div className="map">
      <Map {...props} />
    </div>
  ) : null;
};

export default ShipmentMapSection;
