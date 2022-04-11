/* eslint-disable react/destructuring-assignment */
import React from "react";
import PropTypes from "prop-types";
import countries from "i18n-iso-countries";
import { Flag } from "semantic-ui-react";

import { oPath } from "/imports/utils/functions/path";

const getCountryName = CC => countries.getName(CC.toUpperCase(), "en");

const TrackAddress = props => {
  const { location = {} } = props;
  const { address } = location;
  const { locode } = location;

  if (!props.location) return null;
  return (
    <>
      {address && <AddressFormat location={location} />}
      {locode && <LocationFormat location={location} />}
      {!address && !locode && <SimpleFormat location={location} />}
    </>
  );
};

TrackAddress.propTypes = {
  location: PropTypes.shape({
    countryCode: PropTypes.string.isRequired,
    name: PropTypes.string
  })
};

const AddressFormat = ({ location }) => (
  <>
    <b>{location.name}</b> {location.phoneNumber && ` (${location.phoneNumber})`}
    {location.companyName && (
      <>
        <br />
        {location.companyName}{" "}
      </>
    )}
    <br />
    {location.address.street || ""}
    {location.address.number ? ` ${location.address.number}` : ""}
    {location.address.bus ? ` ${location.address.bus}` : ""}
    <br />
    {location.zipCode} {location.address.city || ""},{getCountryName(location.countryCode)}
  </>
);

const LocationFormat = ({ location }) => (
  <>
    {location.name} <br />
    {oPath(["locode", "id"], location) || ""}
  </>
);

const SimpleFormat = ({ location }) => (
  <>
    {location.name} <br />
    {location.countryCode && <Flag name={location.countryCode.toLowerCase()} />}{" "}
    {getCountryName(location.countryCode)}
    {location.zipCode}
  </>
);

export default TrackAddress;
