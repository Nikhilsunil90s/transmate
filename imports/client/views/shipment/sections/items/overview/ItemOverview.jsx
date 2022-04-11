import React from "react";
import { ItemTreeTable } from "./ItemTreeTable";

/*
const caculateItem = (item, change) => {
  item.weight_net += change;
  item.weight_gross = item.weight_net + item.weight_tare;
};

const caculateHierarchy = (parent, change, arr) => {
  let cur = parent;
  let p = null;

  const func = item => item.id === cur.parentItemId;

  do {
    p = arr.find(func);
    if (p) {
      caculateItem(p, change);
    }
    cur = p;
  } while (p);
};
*/

export const ItemOverview = ({
  data,
  shipment,
  onChangeParentNode: onChangeParentNodeCallback,
  style,
  onRowClick,
  onDelete,
  canEditItems,
  canDrag
}) => {
  // const [data, setDatav] = useState(data);
  // debug("huhuhhuhu", data, data);
  const onChangeParentNode = ({ node, targetParent }) => {
    // const [newDataArr, updatedNodeIds] = changeShipmentItemParentNode({
    //   data,
    //   node,
    //   targetParent
    // });
    // eslint-disable-next-line no-unused-expressions
    onChangeParentNodeCallback && onChangeParentNodeCallback({ node, targetParent });
  };

  return (
    <>
      <ItemTreeTable
        style={style}
        onRowClick={onRowClick}
        data={data}
        shipment={shipment}
        canEditItems={canEditItems}
        canDrag={canDrag}
        onChangeParentNode={onChangeParentNode}
        onDelete={onDelete}
      />
    </>
  );
};
