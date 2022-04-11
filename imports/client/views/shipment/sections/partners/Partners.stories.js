import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import { ShipmentPartnersSection } from "./Partners.jsx";

export default {
  title: "Shipment/Segments/partners"
};

const dummyProps = {
  shipment: {
    _id: "test",
    accountId: "myAccountId",
    shipper: {
      id: "shipperId",
      name: "shipper name",
      annotation: { name: "Shipper" }
    },
    consignee: {
      id: "consgineeId",
      name: "consginee name",
      annotation: { name: "Consignee" }
    },
    providers: [{ id: "provider1", name: "Provider name" }]
  },
  canEdit: true,
  onSaveAction: () => {}
};

export const basic = () => (
  <PageHolder main="Shipment">
    <ShipmentPartnersSection {...dummyProps} />
  </PageHolder>
);

// export const canEdit = () => {
//   return (
//     <PageHolder main="Shipment">
//       <ShipmentNotes {...dummyProps} />
//     </PageHolder>
//   );
// };

// export const empty = () => {
//   dummyProps.shipment.notes = {};
//   return (
//     <PageHolder main="Shipment">
//       <ShipmentNotes {...dummyProps} />
//     </PageHolder>
//   );
// };
