import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const createShipmentSchema = new SimpleSchema({
  type: { type: String },
  title: { type: String },
  year: { type: String }
});

export default new SimpleSchema2Bridge(createShipmentSchema);
