import { Trans } from "react-i18next";
import get from "lodash.get";

import React from "react";
import { ShipmentsTable } from "../table";
import ShipmentContextLabel from "../components/ShipmentContextLabel";

// todo memoize this function
const generateColumnsFromView = view => {
  let cols = ["shipment.number"];

  if (view?.columns?.length) {
    cols = view.columns;
  }

  return [
    ...cols.map(col => {
      const column = {
        ...{ Header: col, accessor: col },
        ...get(ShipmentsTable.columns, col, {})
      };
      if (column.HeaderRender) {
        column.Header = column.HeaderRender;
      } else {
        column.Header = <Trans i18nKey={column.Header} />;
      }
      return column;
    }),
    {
      accessor: "context",
      Cell: ({ value }) => <ShipmentContextLabel context={value} />
    }
  ];
};

export default generateColumnsFromView;
