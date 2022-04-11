import React from "react";
import { Button } from "semantic-ui-react";

import ShipmentListWrapper from "./ShipmentListWrapper";
import AddShipmentModal from "../modals/AddShipmentModal.jsx";
import PaginationFooter from "/imports/client/components/footer/PaginationFooter.jsx";
import useRoute from "/imports/client/router/useRoute";

let triggerExport = () => {};
const InboundTab = ({ canEdit }) => {
  const { params } = useRoute();
  const shipmentProjectId = params._id;

  return (
    <>
      <ShipmentListWrapper
        type="INBOUND"
        shipmentProjectId={shipmentProjectId}
        canEdit={canEdit}
        onExportData={ref => {
          triggerExport = ref;
        }}
      />

      <PaginationFooter shouldShowPagination={false}>
        <AddShipmentModal type="INBOUND" canEdit={canEdit} />
        <Button basic primary icon="download" content="export" onClick={() => triggerExport()} />
      </PaginationFooter>
    </>
  );
};

export default InboundTab;
