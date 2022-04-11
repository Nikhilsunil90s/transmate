import React from "react";
import { Button } from "semantic-ui-react";

import ShipmentListWrapper from "./ShipmentListWrapper";
import AddShipmentModal from "../modals/AddShipmentModal.jsx";
import PaginationFooter from "/imports/client/components/footer/PaginationFooter.jsx";
import useRoute from "/imports/client/router/useRoute";

let triggerExport = () => {};
const OutboundTab = ({ canEdit }) => {
  const { params } = useRoute();
  const shipmentProjectId = params._id;

  return (
    <>
      <ShipmentListWrapper
        shipmentProjectId={shipmentProjectId}
        type="OUTBOUND"
        canEdit={canEdit}
        onExportData={ref => {
          triggerExport = ref;
        }}
      />

      <PaginationFooter shouldShowPagination={false}>
        <AddShipmentModal type="OUTBOUND" canEdit={canEdit} />
        <Button basic primary icon="download" content="export" onClick={() => triggerExport()} />
      </PaginationFooter>
    </>
  );
};

export default OutboundTab;
