/* eslint-disable camelcase */
import pick from "lodash.pick";
import { ShipmentItem } from "../../items/ShipmentItem";
import fixtures from "/imports/api/_jsonSchemas/fixtures/data.items.json";

const debug = require("debug")("shipment:generatePickingItems");

const SHIPMENT_ITEM_ID = "nEv5S78ZKHeo9q4mK";
const FIELDS = [
  "type",
  "itemType",
  "description",
  "level",
  "parentItemId",
  "references",
  "DG",
  "quantity",
  "weight_net",
  "weight_gross",
  "weight_unit",
  "temperature",
  "dimensions",
  "isPicked"
];

const itemDefaults = pick(
  fixtures.find(({ _id }) => _id === SHIPMENT_ITEM_ID) || {},
  FIELDS
);

export const generatePickingItems = async ({
  shipmentId = "",
  count = 10,
  overrides = { isPicked: false },
  keepOtherItems
}) => {
  // remove all others for shipment
  if (!keepOtherItems) {
    await ShipmentItem._collection.remove({ shipmentId });
  }

  const createItem = () =>
    ShipmentItem.create_async({
      level: 0,
      ...itemDefaults,
      shipmentId,
      quantity: {
        code: "BOX",
        amount: 1,
        description: "BOX"
      },
      weight_unit: "kg",
      weight_gross: 120,
      weight_net: 100,
      ...overrides
    });
  const generatedItems = await Promise.all(
    Array(count)
      .fill()
      .map(createItem)
  );
  debug("generatedItems %o", generatedItems);
  return generatedItems.map(({ id: itemId }) => itemId);
};
