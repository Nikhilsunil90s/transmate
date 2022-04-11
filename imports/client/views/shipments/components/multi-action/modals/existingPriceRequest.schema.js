import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const existingPriceRequestSchema = new SimpleSchema({
  priceRequestId: { type: String }
});

export default new SimpleSchema2Bridge(existingPriceRequestSchema);
