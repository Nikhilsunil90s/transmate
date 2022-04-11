/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentView from "./View.jsx";

import fixtureData from "/imports/api/_jsonSchemas/fixtures/data.shipments.views.json";

export default {
  title: "Shipment/views"
};

const dummyView = {
  ...fixtureData[0],
  id: fixtureData[0]._id,
  created: {
    by: fixtureData[0].created.by,
    at: new Date(fixtureData[0].created.at.$date)
  }
};

export const basic = () => {
  const view = { ...dummyView };
  const [state, setState] = useState({
    filters: view.filters || {},
    columns: view.columns || [],
    name: view.name || "",
    shipmentOverviewType: view.shipmentOverviewType || "GBQ",
    isShared: !!view.isShared
  });
  const updateState = data => {
    setState({ ...state, ...data });
  };

  return (
    <PageHolder main="ShipmentsView">
      <ShipmentView {...{ view, state, updateState }} />
    </PageHolder>
  );
};
