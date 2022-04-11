import SimpleSchema from "simpl-schema";

export const AddressInputSchema = new SimpleSchema({
  location: { type: Object, optional: true },
  "location.id": String,
  "location.type": String,
  countryCode: { type: String, optional: true },
  name: { type: String, optional: true },
  street: { type: String, optional: true },
  city: { type: String, optional: true },
  number: { type: String, optional: true }
});
