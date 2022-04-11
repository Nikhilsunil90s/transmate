/* eslint-disable no-use-before-define */
import React from "react";

// UI
import { ReactTable } from "/imports/client/components/tables";
import StatusTag from "./StatusTag";
import SummaryTag from "./SummaryTag";
import ResultsTag from "./ResultsTag";

const DataImportOverview = props => {
  const { loading, rows } = props;

  const columns = [
    {
      Header: "row number",
      accessor: "data.data.rowNum"
    },
    {
      Header: "Data",
      accessor: "data.data", // {}
      Cell: ({ value }) => <SummaryTag value={value} />
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
    <div>
      <ReactTable paginate isLoading={loading} columns={columns} data={rows} />
    </div>
  );
};

export default DataImportOverview;
