/* eslint-disable no-use-before-define */
import React from "react";

// UI
import { ReactTable } from "/imports/client/components/tables";
import DataImportStatus from "/imports/client/views/dataImport/components/StatusTag";
import ShipmentImportSummary from "./ShipmentImportSummary";
import useRoute from "/imports/client/router/useRoute";

const ShipmentImportOverview = props => {
  const { loading, rows } = props;
  const { goRoute } = useRoute();

  const columns = [
    {
      Header: "Number",
      accessor: "data.number"
    },
    {
      Header: "Data",
      accessor: "data.data",
      Cell: ({ row: { original } }) => <ShipmentImportSummary job={original} />
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row: { original } }) => <DataImportStatus job={original} />
    }
  ];

  function handleClicked(selectedShipment) {
    if (!selectedShipment) return;
    goRoute("shipment", selectedShipment);
  }

  return (
    <div>
      <ReactTable
        paginate
        isLoading={loading}
        columns={columns}
        data={rows}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default ShipmentImportOverview;
