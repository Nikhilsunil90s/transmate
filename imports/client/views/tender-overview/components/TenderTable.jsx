/* eslint-disable no-use-before-define */
import React from "react";

import { ReactTableWithRowResizer } from "/imports/client/components/tables";

import TenderOverviewFooter from "./TenderOverviewFooter";
import ActionDropdown from "./ActionDropdown";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tender:overview:table");

const TenderOverview = ({ isDataLoading, data }) => {
  const { goRoute } = useRoute();

  const columns = [
    {
      Header: "Number",
      accessor: "number"
    },
    {
      Header: "Created",
      accessor: "createdAt"
    },
    {
      Header: "Name",
      accessor: "title"
    },
    {
      Header: "Planned closure",
      accessor: "closeDate"
    },
    {
      Header: "Participants",
      accessor: "carrierCount"
    },
    {
      Header: "Status",
      accessor: "status"
    },
    {
      Header: "Actions",
      accessor: "id",
      Cell: ({ row: { original: tender = {} } }) => <ActionDropdown tender={tender} />
    }
  ];

  function handleClicked(selectedRow) {
    if (!selectedRow) return;
    debug("go to tender %o", selectedRow);
    goRoute("tender", { _id: selectedRow.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isDataLoading}
        paginationContent={<TenderOverviewFooter />}
        columns={columns}
        data={data}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default TenderOverview;
