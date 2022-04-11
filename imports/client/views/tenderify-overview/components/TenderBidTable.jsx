/* eslint-disable no-use-before-define */
import React from "react";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { DateTimeTag, DateTag } from "/imports/client/components/tags";
import TenderBidOverviewFooter from "./TenderBidOverviewFooter";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tenderBid:overview");

const TenderBidOverview = ({ isDataLoading, data }) => {
  const { goRoute } = useRoute();
  const columns = [
    {
      Header: "Number",
      accessor: "number"
    },
    {
      Header: "Created",
      accessor: "created.at",
      Cell: ({ value }) => (value ? <DateTag date={value} /> : " - ")
    },
    {
      Header: "Partner",
      accessor: "partner.name"
    },
    {
      Header: "Name",
      accessor: "name"
    },
    {
      Header: "Due date",
      accessor: "tender.dueDate",
      Cell: ({ value }) => (value ? <DateTimeTag date={value} /> : " - ")
    },
    {
      Header: "Status",
      accessor: "status"
    }
  ];

  function handleClicked(selectedRow) {
    if (!selectedRow) return;
    debug("go to tenderBid %o", selectedRow);
    goRoute("bid", { _id: selectedRow.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isDataLoading}
        paginationContent={<TenderBidOverviewFooter />}
        columns={columns}
        data={data}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default TenderBidOverview;
