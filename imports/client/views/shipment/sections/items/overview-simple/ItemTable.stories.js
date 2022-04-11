import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ItemTable from "./ItemTable";

import { buildNestedItems } from "/imports/api/items/items-helper";
import { nestedItemsData } from "./storyData";

export default {
  title: "Shipment/Segments/items/staticOverview"
};

export const basic = () => {
  const items = buildNestedItems([nestedItemsData[0]]);
  return (
    <PageHolder main="Shipment">
      <ItemTable items={items} isDataLoading={false} />
    </PageHolder>
  );
};

export const complex = () => {
  const items = buildNestedItems(nestedItemsData);
  return (
    <PageHolder main="Shipment">
      <ItemTable items={items} isDataLoading={false} />
    </PageHolder>
  );
};
