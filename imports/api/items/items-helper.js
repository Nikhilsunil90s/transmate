export const caculateShipmentItem = (item, change) => {
  // eslint-disable-next-line no-param-reassign
  change = change || 0;
  item.weight_net = item.weight_net || 0;
  item.weight_net += change;
  item.weight_gross =
    (item.weight_net ? item.weight_net : 0) +
    (item.weight_tare ? item.weight_tare : 0);
};

export const caculateShipmentItemHierarchy = (parent, change, arr) => {
  let cur = parent;
  let p = null;
  const updatedNodeIds = [];

  const func = item => item.id === cur.parentItemId;

  do {
    p = arr.find(func);
    if (p) {
      caculateShipmentItem(p, change);
      updatedNodeIds.push(p.id);
    }
    cur = p;
  } while (p);

  return updatedNodeIds;
};

export const changeShipmentItemParentNode = ({ data, node, targetParent }) => {
  const oldParent = data.find(item => item.id === node.parentItemId);
  const pn = targetParent
    ? data.find(item => item.id === targetParent.id)
    : null;
  const newData = data.map(item => {
    if (item.id === node.id) {
      item.parentItemId = pn ? pn.id : null;
    }
    return item;
  });

  const updatedNodeIds = [node.id];

  // Recalculate weight net & gross of the parent level:
  // Weight_net: sum of weight_gross of all items underneath parent
  // Weight_gross: parent.weight_net + parent.tare
  if (oldParent) {
    const change = -node.weight_gross;

    caculateShipmentItem(oldParent, change);
    const ids = caculateShipmentItemHierarchy(oldParent, change, newData);
    updatedNodeIds.push(oldParent.id);
    updatedNodeIds.splice(updatedNodeIds.length, 0, ...ids);
  }
  if (pn) {
    const change = node.weight_gross;

    caculateShipmentItem(pn, change);
    const ids = caculateShipmentItemHierarchy(pn, change, newData);
    updatedNodeIds.push(pn.id);
    updatedNodeIds.splice(updatedNodeIds.length, 0, ...ids);
  }

  return [newData, updatedNodeIds];
};

export const changeNodeChildrenLevel = ({ data, nodeId, change }) => {
  const updateIds = [];

  const children = data.filter(({ parentItemId }) => parentItemId === nodeId);

  children.forEach(nc => {
    const { id } = nc;
    nc.level += change;
    updateIds.push(id);

    const uptIds = changeNodeChildrenLevel({ data, nodeId: id, change });

    updateIds.splice(updateIds.length, 0, ...uptIds);
  });
  return updateIds;
};

/** groups items and places childitems under subItems key
 * @returns {[Object]} items with nested subItems
 */
export const buildNestedItems = (items = []) => {
  const minLevel = Math.min(...items.map(({ level }) => level)) || 0;
  const resItems = [];

  // lvl 0:
  items
    .filter(({ level }) => level === minLevel)
    .forEach(item => resItems.push({ ...item, subItems: [] }));

  // lvl 1:
  items
    .filter(({ level }) => level === minLevel + 1)
    .forEach(({ parentItemId, ...item }) => {
      const idx = resItems.findIndex(
        ({ _id, id }) => _id === parentItemId || id === parentItemId
      );

      if (idx > -1) {
        resItems[idx].subItems.push({ ...item, subitems: [] });
      }
    });

  return resItems;
};
