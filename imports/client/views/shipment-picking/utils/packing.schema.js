import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const packingSchema = new SimpleSchema({
  parentItem: { type: String },
  code: { type: String, optional: true },
  description: { type: String, optional: true },
  weight: {
    type: Number,
    min: 0,
    exclusiveMin: true
  },
  weight_unit: {
    type: String
  },
  dimensions: {
    optional: true,
    type: new SimpleSchema({
      height: {
        type: Number,
        min: 0,
        optional: true
      },
      width: {
        type: Number,
        min: 0,
        optional: true
      },
      length: {
        type: Number,
        min: 0,
        optional: true
      },
      uom: {
        type: String,
        optional: true
      }
    })
  }
});

export default new SimpleSchema2Bridge(packingSchema);
