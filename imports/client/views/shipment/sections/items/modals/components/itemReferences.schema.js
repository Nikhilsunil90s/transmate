import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

const ItemReferenceSchema = new SimpleSchema({
  quantity: { type: Object },
  "quantity.amount": { type: Number },
  "quantity.unit": { type: String }
});

export default new SimpleSchema2Bridge(ItemReferenceSchema);
