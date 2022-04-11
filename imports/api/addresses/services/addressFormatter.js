import get from "lodash.get";
import countries from "i18n-iso-countries";

const getCountryName = CC => countries.getName(CC.toUpperCase(), "en");

const addressFormat = ({ location }) => {
  return `${get(location, "address.street", "")} ${get(
    location,
    "address.number",
    ""
  )} ${get(location, "address.bus", "")}, ${get(location, "zipCode") ||
    get(location, "address.zip", "")} ${get(
    location,
    "address.city"
  )}, ${getCountryName(location.countryCode)}`;
};

const locationFormat = ({ location }) =>
  `${get(location, "locode.id", "")}, ${get(location, "name", "")}`;

export const addressFormatter = ({ location = {} }) => {
  return location.locode
    ? locationFormat({ location })
    : addressFormat({ location });
};
