import React from "react";
import { Table, Popup } from "semantic-ui-react";

const getAllRefs = ({ number, references = {} }) => {
  return Object.entries({ TMnumber: number, ...references })
    .filter(([k, v]) => !!v && k !== "__typename")
    .map(([key, value]) => ({ key, value }));
};

const ShipmentReferenceTag = ({ shipment = {} }) => {
  const { number, references = {} } = shipment;
  const allRefs = getAllRefs({ number, references });
  const reference = references?.number || number;
  return (
    <Popup
      disabled={allRefs.length < 2}
      content={
        <Table
          tableData={allRefs}
          renderBodyRow={({ key, value }) => ({
            key,
            cells: [key, value]
          })}
        />
      }
      trigger={<span>{reference}</span>}
    />
  );
};

export default ShipmentReferenceTag;
