import SimpleSchema from "simpl-schema";

export const ProcessMethodSchema = new SimpleSchema({
  data: {
    type: Object,
    blackbox: true
  },
  importId: String,
  accountId: String,
  userId: String,
  references: { type: Object, blackbox: true }
});

export const RevertSchema = new SimpleSchema({
  importId: String,
  accountId: String,
  userId: String
});
