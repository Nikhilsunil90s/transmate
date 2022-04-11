import React from "react";

import PageHolder from "../../../../../components/utilities/PageHolder";
import ShipmentCostChange from "./CostChange.jsx";

export default {
  title: "Shipment/Segments/costs/change"
};

const dummyProps = {
  shipment: {
    _id: "test",
    carrierIds: ["carrier1"],
    costs: [],
    carrier: () => ({ name: "carrier" })
  },
  canSelectCarrier: true
};

export const basic = () => (
  <PageHolder main="Shipment">
    <ShipmentCostChange {...dummyProps} />
  </PageHolder>
);

// export const empty = () => {
//   dummyProps.shipment.updates = [];
//   return (
//     <PageHolder main="Shipment">
//       <ShipmentCostsSection {...dummyProps} />
//     </PageHolder>
//   );
// };
