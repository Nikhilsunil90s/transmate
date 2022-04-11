import React, { useMemo } from "react";

import { Trans } from "react-i18next";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { ReactTable } from "/imports/client/components/tables";
import { prepareRowData, prepareColumns } from "../utils/gridHelpers.js";

//#region components
const debug = require("debug")("tender:UI");

const Table = ({ columns, data }) => {
  function handleClicked(selectedId) {
    if (!selectedId) return;
    debug("selected", selectedId);
  }
  return (
    <ReactTable
      tableClass="ui table"
      columns={columns}
      data={data}
      onRowClicked={handleClicked}
      getCellProps={cellInfo => {
        let val = cellInfo.value;
        if (val && typeof val.nda === "boolean") {
          val = val.nda;
        }
        if (val === true) {
          return { className: "positive center aligned", style: {} };
        }
        if (val === false) {
          return { className: "negative center aligned", style: {} };
        }
        return {};
      }}
    />
  );
};

const BidderOverview = ({ ...props }) => {
  const { tender } = props;
  const bidders = tender?.bidders || [];
  const packages = tender.packages || [];

  const hasBidders = bidders.length > 0;

  const data = useMemo(
    () =>
      prepareRowData({ bidders, tenderPackages: packages })
        .timeStamps()
        .getNDA()
        .bidGroups()
        .get(),
    []
  );

  const columns = useMemo(() => prepareColumns({ bidders }), []);

  return hasBidders ? (
    <div>
      <Table columns={columns} data={data} />
    </div>
  ) : (
    <p>
      <Trans i18nKey="tender.summary.grid.empty" />
    </p>
  );
};
//#endregion

const BidderOverviewSection = ({ ...props }) => {
  const { tender = {} } = props;
  const bidders = tender.bidders || [];
  debug("bidders %o", bidders);

  return (
    <IconSegment
      name="bidders"
      icon="paperclip"
      title={<Trans i18nKey="tender.dashboard.grid.title" />}
      body={
        bidders.length ? (
          <BidderOverview {...props} />
        ) : (
          <p>
            <Trans i18nKey="tender.dashboard.noPartners" />
          </p>
        )
      }
    />
  );
};

export default BidderOverviewSection;
