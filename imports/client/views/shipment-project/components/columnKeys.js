const COLUMN_KEYS = {
  ID: "id",
  STATUS: "status",
  REF_NO: "references.number", // editable
  CARRIER_NAME: "carrier.id", // editable
  CARRIER: "carrier",
  SHIPPER_NAME: "shipper.id", // editable
  SHIPPER: "shipper", // editable
  MODE: "type", // editable
  EQUIPMENT_TYPE: "firstItem.quantity.code", // editable
  ITEM_CONDITION: "firstItem.temperature", // editable
  EQUIPMENT_ID: "firstItem.references", // {}
  ITEM: "firstItem", // {}
  PICKUP_DATES: "pickupDate", // { date, isPlanned, isScheduled, isActual, timeZone }
  PICKUP_LOCATION: "pickup.location", // {}
  DELIVERY_DATES: "deliveryDate", // { date, isPlanned, isScheduled, isActual, timeZone }
  DELIVERY_LOCATION: "delivery.location", // {}
  IS_TENDERED: "isTendered",
  TOTAL_COST: "totals",
  MANUAL_COST: "totals"
};

export default COLUMN_KEYS;
