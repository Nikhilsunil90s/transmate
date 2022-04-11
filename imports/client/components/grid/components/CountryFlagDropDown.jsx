import React from "react";
import CountryFlag from "/imports/client/components/tags/CountryFlag";
import { Address } from "/imports/api/addresses/Address.js";

export const countryOptions = Address.countryCodes();

/** value is a ISO2 country code */
export default ({ value }) => {
  return value ? (
    <span>
      <CountryFlag countryCode={value.toLowerCase()} />
    </span>
  ) : (
    value
  );
};
