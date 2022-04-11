import SimpleSchema from "simpl-schema";
const OptionalByAtSchema = new SimpleSchema({
    by: {
      type: String,

      optional: true
    },
    at: {
      type: Date
    }
  });
 const commonKeys = {
    _id: { type: String, optional: true },
    created: {
      type: OptionalByAtSchema,
      optional: true
    },
    updated: {
      type: OptionalByAtSchema,
      optional: true
    },
    deleted: { type: Boolean, defaultValue: false, optional: true }
  };

  exports.commonKeys= commonKeys;