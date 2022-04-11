import React, { useEffect } from "react";

import Footer from "./Footer";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import useRoute from "/imports/client/router/useRoute";

const ShipmentsTable = ({
  dbData,
  loading,
  setSelectedShipments,
  fetchShipments,
  columns = [],
  fetchTrigger
}) => {
  let tableActions;
  const totalNumberOfShipments = dbData.recordsTotal;

  useEffect(() => {
    // sets the page to 0 if the data is refreshed due to a viewId change:
    if (tableActions.gotoPage) tableActions.gotoPage(0);
  }, [fetchTrigger]);

  const { goRoute } = useRoute();

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%", overflowY: "auto" }}>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        resultLength={totalNumberOfShipments}
        isLoading={loading}
        columns={columns}
        getTableActions={actions => {
          tableActions = actions;
        }}
        onSelectedRows={processedSelectedIds => setSelectedShipments(processedSelectedIds)}
        fetchData={fetchShipments}
        fetchTriggers={[fetchTrigger]}
        data={dbData.data || []}
        onRowClicked={(row = {}) => goRoute("shipment", { _id: row._id })}
        paginationContent={<Footer />}
      />
    </div>
  );
};

export default ShipmentsTable;
