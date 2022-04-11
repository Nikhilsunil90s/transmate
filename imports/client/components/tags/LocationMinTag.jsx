import React from "react";
import { Flag } from "semantic-ui-react";

const LocationMinTag = ({ location }) => {
  const { name, countryCode } = location;

  return (
    <>
      <Flag name={countryCode.toLowerCase()} />
      <b>{name}</b>
    </>
  );
};

export default LocationMinTag;
