import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import DonutChart from "./DonutChart.jsx";
import MapChart from "./MapChart.jsx";
import GeoChart from "./GeoChart.jsx";

export default {
  title: "Components/charts"
};

export const donut = () => {
  const props = {
    data: [26, 48, 9, 127],
    labels: ["planned", "completed", "started", "draft"]
  };
  return (
    <PageHolder main="AccountPortal">
      <div style={{ width: "100%", height: "400px" }}>
        <DonutChart {...props} />
      </div>
    </PageHolder>
  );
};

export const map = () => {
  const props = {
    locations: [
      { latitude: 32.377716, longitude: -86.300568, value: 8, name: "test" },
      { latitude: 0, longitude: 0, value: 10, name: "test" }
    ]
  };
  return (
    <PageHolder main="AccountPortal">
      <div style={{ position: "relative", width: "600px", height: "400px" }}>
        <MapChart {...props} />
      </div>
    </PageHolder>
  );
};

export const geoChart = () => {
  const props = {
    locations: [
      { location: { lat: 32.377716, lng: -86.300568 }, name: "test" },
      { location: { lat: 48.2085962, lng: 16.3672185 }, name: "test2" },
      { location: { lat: 48.2026579, lng: 16.3722092 }, name: "test3" },
      { location: { lat: 47.5817111, lng: 19.2506106 }, name: "test4" },
      { location: { lat: 48.16149, lng: 14.04894 }, name: "test5" }
    ]
  };
  return (
    <PageHolder main="AccountPortal">
      <div style={{ position: "relative", width: "600px", height: "400px" }}>
        <GeoChart {...props} />
      </div>
    </PageHolder>
  );
};
