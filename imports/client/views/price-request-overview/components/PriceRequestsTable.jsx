/* eslint-disable no-use-before-define */
import React from "react";
import PropTypes from "prop-types";

import { ReactTableWithRowResizer } from "../../../components/tables";
import RelativeTimeCounter from "./RelativeTimeCounter";

import StatusRender from "/imports/client/views/price-request/components/PriceRequestStatus";
import useRoute from "/imports/client/router/useRoute";

const PriceRequestsTable = ({ priceRequests, isRequestsLoading, serverTimeDifference }) => {
  const { goRoute } = useRoute();
  const columns = [
    { Header: "Ref", accessor: "title" },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row = {} }) => {
        return <StatusRender priceRequest={row.original} />;
      }
    },
    {
      Header: "Partner(s)",
      accessor: "partners",
      Cell: ({ row }) => {
        const { original } = row || {};
        const { partners } = original || {};
        let text = partners;
        if ((partners || "").length > 50) text = `${partners.slice(0, 50)}...`;
        return text;
      }
    },
    { Header: "Requested By", accessor: "requestedByName" },
    { Header: "Items", accessor: "numberOfItems" },
    {
      Header: "Due In",
      accessor: "dueDate",
      Cell: ({ row }) => {
        const { original } = row || {};
        const { dueDate, status } = original || {};
        return (
          <RelativeTimeCounter
            dueDate={dueDate}
            status={status}
            serverTimeDifference={serverTimeDifference}
          />
        );
      }
    }
  ];

  function handlePriceRequestClicked(priceRequest = {}) {
    goRoute("priceRequestEdit", { _id: priceRequest.id });
  }

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%", overflowY: "scroll" }}>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isRequestsLoading}
        columns={columns}
        data={priceRequests}
        onRowClicked={handlePriceRequestClicked}
      />
    </div>
  );
};

PriceRequestsTable.propTypes = {
  priceRequests: PropTypes.arrayOf(PropTypes.object),
  isRequestsLoading: PropTypes.bool
};

export default PriceRequestsTable;
