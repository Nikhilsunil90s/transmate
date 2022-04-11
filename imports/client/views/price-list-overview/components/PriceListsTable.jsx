/* eslint-disable no-use-before-define */
import React from "react";
import PropTypes from "prop-types";

import { ReactTableWithRowResizer } from "../../../components/tables";
import TableCellPriceStatus from "./TableCellPriceStatus";
import PriceListActionDropdown from "./PriceListActionDropdown";
import PriceListFooterButtons from "./PriceListFooterButtons";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("pricelist:table");

const PriceListsTable = ({ priceLists, isLoadingPriceLists }) => {
  const { goRoute } = useRoute();
  debug("priceLists %o", priceLists);
  const columns = [
    { Header: "Carrier", accessor: "carrierName" },
    { Header: "Name", accessor: "title" },
    { Header: "Lanes", accessor: "summary.laneCount" },
    { Header: "Mode", accessor: "mode" },
    { Header: "Valid to", accessor: "validTo" },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row: { original } }) => <TableCellPriceStatus priceList={original} />
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row: { original } }) => <PriceListActionDropdown priceList={original} canEdit />
    }
  ];

  function handlePriceListClicked(selectedPriceList) {
    if (!selectedPriceList) return;
    goRoute("priceList", { _id: selectedPriceList.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isLoadingPriceLists}
        paginationContent={<PriceListFooterButtons />}
        columns={columns}
        data={priceLists}
        onRowClicked={handlePriceListClicked}
      />
    </div>
  );
};

PriceListsTable.propTypes = {
  priceLists: PropTypes.arrayOf(PropTypes.object),
  isLoadingPriceLists: PropTypes.bool
};

export default PriceListsTable;
