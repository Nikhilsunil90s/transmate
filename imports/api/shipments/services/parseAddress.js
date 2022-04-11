import { pick } from "../../../utils/functions/fnObjectPick";
import { oPath } from "../../../utils/functions/path";

// data
import { Address } from "../../addresses/Address";
import { Location } from "../../locations/Location";

/** gets the address information from the db
 * @param {{id: String, type: String}} location location to look up
 * @param {String} accountId
 * @returns {{location: Object, address: Object}} location object, either locode or address
 */
export const parseAddress = async ({ location, accountId }) => {
  if (location && location.type && location.type === "address") {
    const addressDoc = await Address.first(
      {
        _id: location.id,
        "accounts.id": accountId // only if I am linked
      },
      {
        fields: {
          ...Address.publish,
          accounts: {
            $elemMatch: {
              id: accountId
            }
          }
        }
      }
    );

    if (!addressDoc) {
      throw new Meteor.Error(
        "not-allowed",
        "This address is not in your address book."
      );
    }
    const address = {
      latLng: addressDoc.location,
      countryCode: addressDoc.countryCode,
      zipCode: addressDoc.zip,
      timeZone: addressDoc.timeZone,
      name:
        oPath(["accounts", 0, "name"], addressDoc) ||
        oPath(["aliases", 0], addressDoc) ||
        "unknown",
      addressId: addressDoc._id,
      address: pick(addressDoc, "street", "number", "bus", "city", "state")
    };
    return { address };
  }
  if (location && location.type && location.type === "location") {
    const locationDoc = await Location.first(location.id);
    const locationRes = Object.assign(
      pick(locationDoc, "latLng", "countryCode", "name"),
      {
        locode: {
          id: locationDoc.id,
          code: locationDoc.locationCode,
          function: locationDoc.function
        }
      }
    );
    return { location: locationRes };
  }

  return {};
};
