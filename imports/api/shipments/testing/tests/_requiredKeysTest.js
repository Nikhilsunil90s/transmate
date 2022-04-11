export const SHIPMENT_KEYS = [
  "pickup",
  "delivery",
  "type",

  // "serviceLevel",
  // "incoterm",
  "accountId",
  "shipperId",

  // "notes",
  "created",
  "number",

  // "updates",
  "status"

  // "stageIds" // is async , will not work in graphql
];

export const STAGE_KEYS = [
  "mode",
  "sequence",
  "from",
  "to",
  "shipmentId",
  "dates",
  "created",
  "status",

  // "updated",
  "created"
];
