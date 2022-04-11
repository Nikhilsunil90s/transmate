/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import React from "react";
import { Table } from "semantic-ui-react";
import get from "lodash.get";

const debug = require("debug")("price-request:view:shipmentitems");

const ItemSummary = ({ items = [] }) => {
  const allItems = items.filter(item => Object.keys(item).length);
  debug("items %o", items);
  return (
    <Table
      headerRow={["Quantity", "Unit", "Description", "Net", "Gross", ""]}
      renderBodyRow={({
        id,
        quantity,
        quantity_unit,
        quantity_unit_description,
        description,
        weight_net,
        weight_gross,
        weight_unit,
        material
      }) => ({
        key: id,
        cells: [
          { key: "quantity", content: quantity },
          { key: "quantity_unit", content: quantity_unit_description || quantity_unit },
          { key: "description", content: get(material, "description") || description },
          { key: "weight_net", content: weight_net },
          { key: "weight_gross", content: weight_gross },
          { key: "weight_unit", collapsing: true, content: weight_unit }
        ]
      })}
      tableData={allItems}
    />
  );
};
export default ItemSummary;
