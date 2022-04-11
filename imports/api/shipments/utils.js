import get from "lodash.get";
import { truncate } from "/imports/utils/functions/fnTruncate.js";

export const getReferenceNumber = shipment => {
  return truncate(get(shipment, "references.number", shipment.number), 12);
};
