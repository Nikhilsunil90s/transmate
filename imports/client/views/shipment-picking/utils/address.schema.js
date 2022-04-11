import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const addressSchema = new SimpleSchema({
  location: Object,
  "location.id": String,
  "location.type": String
});

export default new SimpleSchema2Bridge(addressSchema);
