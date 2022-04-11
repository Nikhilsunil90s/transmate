import React from "react";
import { ReactTable } from "/imports/client/components/tables";

import StatusTag from "./StatusTag";
import SummaryTag from "./SummaryTag";
import ResultsTag from "./ResultsTag";

const DataImportOverview = ({ isLoadingDocuments, documents }) => {
  const columns = [
    {
      Header: "row number",
      accessor: "data.data.rowNum"
    },
    {
      Header: "Data",
      accessor: "data.data",
      Cell: ({ row: { original } }) => <SummaryTag value={original.data.data} />
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row: { original } }) => <StatusTag job={original} />
    },
    {
      Header: "Result",
      accessor: "result",
      Cell: ({ row: { original } }) => <ResultsTag job={original} />
    }
  ];

  return (
    <div className="DataImport">
      <ReactTable paginate isLoading={isLoadingDocuments} columns={columns} data={documents} />
    </div>
  );
};

export default DataImportOverview;
