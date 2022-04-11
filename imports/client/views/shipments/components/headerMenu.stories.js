import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import HeaderMenu from "./HeaderMenu.jsx";

export default {
  title: "components/tables/ShipmentOverviewHeader"
};

const dummyProps = {
  viewName: "dummyViewName",
  viewId: "DummyId",
  selectedShipments: [],
  onChangeView: () => {},
  views: [],
  loading: false
};

export const basic = () => {
  const props = { ...dummyProps };
  props.loading = false;
  return (
    <PageHolder main="Shipments">
      <HeaderMenu {...props} />
    </PageHolder>
  );
};

export const loading = () => {
  const props = { ...dummyProps };
  props.loading = true;
  props.viewName = "not selectable";
  return (
    <PageHolder main="Shipments">
      <HeaderMenu {...props} />
    </PageHolder>
  );
};

export const shipmentsSelected = () => {
  const props = { ...dummyProps };
  props.selectedShipments = [{ _id: "testShipmentId" }];
  return (
    <PageHolder main="Shipments">
      <HeaderMenu {...props} />
    </PageHolder>
  );
};
