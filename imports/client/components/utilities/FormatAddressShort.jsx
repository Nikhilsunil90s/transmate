/* eslint-disable no-use-before-define */
import React from "react";
import get from "lodash.get";
import { Flag } from "semantic-ui-react";

/** formats an address */
const FormatAddressShort = ({ location = {}, options = {} }) => {
  const opts = {
    useFlag: true,
    ...options
  };
  const name = get(location, ["annotation", "name"], location.name);
  const city = get(location, ["address", "city"]);

  if (location.countryCode) {
    return (
      <>
        {opts.useFlag && <Flag countryCode={location.countryCode} />}
        {location.zipCode}
        {city && <span style={{ opacity: 0.5 }}>{city}</span>}
        {name && name}
      </>
    );
  }
  return " - ";
};

export default FormatAddressShort;
