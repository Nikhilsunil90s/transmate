import React from "react";

import NavBar from "./NavBar";

export default {
  title: "Layout/navbar"
};

const dummyProps = {
  activeRoute: "shipment",
  accountFeatures: [
    "shipment",
    "shipmentProjects",
    "partner",
    "location",
    "price-analysis",
    "price-list",
    "tender",
    "reporting",
    "invoice-check",
    "price-list-create",
    "price-list-request",
    "price-list-share",
    "price-lookup"
  ]
};

export const full = () => {
  return (
    <div className="app">
      <NavBar {...dummyProps} />
    </div>
  );
};

export const submenu = () => {
  const props = {
    ...dummyProps,
    accountFeatures: ["shipment", "shipmentProjects"]
  };
  return (
    <div className="app">
      <NavBar {...props} />
    </div>
  );
};

export const hiddenSubmenu = () => {
  const props = {
    ...dummyProps,
    accountFeatures: ["shipment"]
  };
  return (
    <div className="app">
      <NavBar {...props} />
    </div>
  );
};
