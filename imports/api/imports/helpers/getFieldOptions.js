import { ShipmentSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment";
import { ShipmentItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment-item";
import { StageSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/stage";

/**
 * @param {string} key
 * @returns {Array<{value: string, text: string}> | string}
 */
export function getFieldOptions(key) {
  let Schema;

  if (key === "item.quantity_unit") return "quantityUnit";
  if (key === "stage.from.address.country") return "countryCode";
  if (key === "stage.to.address.country") return "countryCode";

  const keys = key.split(".");
  switch (keys.shift()) {
    case "shipment":
      Schema = ShipmentSchema;
      break;
    case "item":
      Schema = ShipmentItemSchema;
      break;
    case "stage":
      Schema = StageSchema;
      break;
    default:
      Schema = undefined;
  }

  return ((Schema && Schema.get(keys.join("."), "allowedValues")) || []).map(
    v => ({
      value: v,
      text: v
    })
  );
}
