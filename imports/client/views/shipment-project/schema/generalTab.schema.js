import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { ShipmentProjectSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment-projects";

const generalTabSchema = ShipmentProjectSchema.pick(
  "title",
  "year",
  "status",
  "eventDate",
  "attendees",
  "budget"
).extend(
  new SimpleSchema({
    type: String,
    location: {
      type: new SimpleSchema({ type: String, id: String }),
      optional: true
    }
  })
);
export default new SimpleSchema2Bridge(generalTabSchema);
