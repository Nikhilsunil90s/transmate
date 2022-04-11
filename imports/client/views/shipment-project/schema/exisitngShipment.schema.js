import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const existingShipmentSchema = new SimpleSchema({
  shipmentId: { type: String }
});

export default new SimpleSchema2Bridge(existingShipmentSchema);
