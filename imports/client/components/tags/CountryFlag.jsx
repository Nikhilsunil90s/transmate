import React from "react";
import { Flag } from "semantic-ui-react";
import { addressSrv } from "/imports/api/addresses/services/addressSrv";

const CountryFlag = ({ countryCode }) => (
  <>
    {countryCode && (
      <>
        <Flag name={countryCode.toLowerCase()} />{" "}
      </>
    )}
    {countryCode ? addressSrv.countryName(countryCode) : " - "}
  </>
);

export default CountryFlag;
