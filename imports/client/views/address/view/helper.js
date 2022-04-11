import pick from "lodash.pick";
import get from "lodash.get";

export const addressToLocationType = (addressDoc = {}) => ({
  countryCode: addressDoc.countryCode,
  addressId: addressDoc._id,
  latLng: addressDoc.location,
  name: get(addressDoc, "annotation.name"),
  address: pick(addressDoc, [
    "street",
    "number",
    "bus",
    "zipCode",
    "zip",
    "city"
  ])
});
