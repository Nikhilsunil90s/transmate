import React from "react";
import { Table, Segment, Button } from "semantic-ui-react";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

// UI
const ShipmentSummary = ({ shipment = {} }) => {
  const { number, references = {} } = shipment;
  const refs = Object.entries({ TMnumber: number, ...references }).filter(
    ([k, v]) => !!v && k !== "__typename"
  );
  return (
    <Segment>
      <Table
        renderBodyRow={([key, v], i) => ({
          key: i,
          cells: [
            { key: "label", content: key },
            { key: "value", content: v }
          ]
        })}
        tableData={refs}
      />
      <Button
        primary
        as="a"
        href={generateRoutePath("shipment", { _id: shipment.id })}
        target="_blank"
        content="View shipment"
      />
    </Segment>
  );
};

export default ShipmentSummary;
