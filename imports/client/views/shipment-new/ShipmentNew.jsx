import React from "react";
import useRoute from "../../router/useRoute";
import ShipmentForm from "./components/ShipmentForm.jsx";

const ShipmentNew = () => {
  const { goRoute } = useRoute();
  const afterCreateCallback = shipmentId => goRoute("shipment", { _id: shipmentId });
  return <ShipmentForm afterCreateCallback={afterCreateCallback} />;
};

export default ShipmentNew;
