/* eslint-disable no-unused-vars */
import React from "react";
import { Table } from "semantic-ui-react";

const COLORS = [
  "green",
  "yellow",
  "olive",
  "teal",
  "blue",
  "violet",
  "purple",
  "pink",
  "red",
  "orange",
  "brown",
  "grey",
  "black"
];

const AllocationGrid = ({ priceLists = [], scope, detail }) => {
  const horizontal = scope?.equipments || scope?.volumes || [];
  const allLanes = scope?.lanes || [];
  const alloc = detail.allocation || [];
  const single = alloc.length < 2;

  const getPriceListLabel = priceListId => {
    const info = priceLists.find(({ id }) => id === priceListId);
    return info.alias || info.carrierName || priceListId;
  };

  function getAllocation({ laneId, horizontalId }) {
    const allocation = alloc.find(item => {
      return !!item.groups.find(
        ({ lanes, equipments }) => lanes.id === laneId && equipments.id === horizontalId
      );
    });
    return allocation ? getPriceListLabel(allocation.priceListId) : "-";
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell content="" />
          {horizontal.map(({ name, id }) => (
            <Table.HeaderCell key={`col-${id}`} content={name} />
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {allLanes.map(({ name, id: laneId }) => (
          <Table.Row key={`row-${laneId}`}>
            <Table.Cell content={name} />
            {horizontal.map(({ id: horizontalId }) => {
              const allocation = getAllocation({ laneId, horizontalId });
              return <Table.Cell key={`cell-${laneId}-${horizontalId}`} content={allocation} />;
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default AllocationGrid;
