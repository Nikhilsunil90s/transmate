import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";

const addPlannerSchema = new SimpleSchema({
  planner: { type: String }
});

export default new SimpleSchema2Bridge(addPlannerSchema);
