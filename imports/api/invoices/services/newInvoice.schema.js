import SimpleSchema from "simpl-schema";

export const NewInvoiceSchema = new SimpleSchema({
  number: String,
  date: Date,
  partnerId: String,
  role: {
    type: String,
    defaultValue: "customer",
    allowedValues: ["customer", "vendor"]
  }
});
