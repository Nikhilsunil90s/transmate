/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { ItemOverview } from "./ItemOverview";
import { changeShipmentItemParentNode } from "../../../../../../api/items/items-helper";

export default {
  title: "Shipment/Segments/items/treeTable"
};

// TODO [#271]:mock data
const data = [
  {
    id: 1,
    parentItemId: undefined,
    weight_net: 9,
    weight_tare: 0,
    weight_gross: 9
  },
  {
    id: 2,
    parentItemId: undefined,
    weight_net: 2,
    weight_tare: 0,
    weight_gross: 2
  },
  {
    id: 3,
    parentItemId: undefined,
    weight_net: 3,
    weight_tare: 0,
    weight_gross: 3
  },
  {
    id: 4,
    parentItemId: 1,
    weight_net: 4,
    weight_tare: 0,
    weight_gross: 4
  },
  {
    id: 5,
    parentItemId: 1,
    type: "folder",
    weight_net: 5,
    weight_tare: 0,
    weight_gross: 5
  }
];

const shipment = {
  id: "testId",
  references: {
    number: "TST"
  }
};

export const basic = () => {
  const [datav, setDatav] = useState(data);
  const onChangeParentNode = params => {
    console.log("onChangeParentNode", params);
    const { node, targetParent } = params;
    const [newDataArr, updatedNodeIds] = changeShipmentItemParentNode({
      data,
      node,
      targetParent
    });
    console.log("....", updatedNodeIds);
    setDatav(newDataArr);
  };
  return (
    <PageHolder main="Shipment">
      <div style={{ height: 300 }}>
        <ItemOverview
          onChangeParentNode={onChangeParentNode}
          data={datav}
          shipment={shipment}
        />
      </div>
    </PageHolder>
  );
};
