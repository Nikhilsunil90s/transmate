import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ShipmentItemSchema } from "../../../../../../api/_jsonSchemas/simple-schemas/collections/shipment-item";

const ItemModalSchema = ShipmentItemSchema.omit(
  "shipmentId",
  "parentItemId",
  "level"
);

export default new SimpleSchema2Bridge(ItemModalSchema);
