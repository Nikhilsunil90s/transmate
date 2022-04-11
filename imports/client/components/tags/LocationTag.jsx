import React, { useState } from "react";
import PropTypes from "prop-types";
import countries from "i18n-iso-countries";
import { Flag, Icon } from "semantic-ui-react";
import AddressInfoModal from "/imports/client/views/address/view/ViewModal";

import get from "lodash.get";
import { LocationType } from "./LocationTag.proptypes";

//#region components
const getCountryName = CC => countries.getName(CC.toUpperCase(), "en");

export const AddressFormat = ({ location }) => (
  <>
    {location.address?.street || ""} {location.address?.number || ""}
    {location.address?.bus || ""}
    <br />
    {location.zipCode || location.address?.zip} {location.address?.city || ""},{" "}
    {getCountryName(location.countryCode || "")}
  </>
);

const LocationFormat = ({ location }) =>
  `${get(location, "locode.id", "")}, ${get(location, "name", "")}`;

const SimpleFormat = ({ location }) => (
  <>
    {location.countryCode && <Flag name={location.countryCode.toLowerCase()} />}{" "}
    {getCountryName(location.countryCode)}
    {location.zipCode}
  </>
);

const AddressSummaryFormat = ({ location }) => (
  <>
    {location.countryCode && <Flag name={location.countryCode.toLowerCase()} />}
    {location.zipCode || location.address.zip} {location.address.city || ""}
    {location.name ? ` (${location.name})` : null}
  </>
);

const LocodeSummaryFormat = ({ location }) => (
  <>
    {location.countryCode && <Flag name={location.countryCode.toLowerCase()} />}
    {location.locode.id}
  </>
);

//#endregion

// summary tag export
export const LocationSummaryTag = props => {
  const { location = {} } = props;
  const { address, locode } = location;

  if (!location) return null;

  return (
    <>
      {address && <AddressSummaryFormat location={location} />}
      {locode && <LocodeSummaryFormat location={location} />}
    </>
  );
};

// default export:
const LocationTag = props => {
  const [show, showModal] = useState(false);

  const { location = {}, annotation = {} } = props;
  const { address } = location;
  const { locode } = location;

  if (!location) return null;
  return (
    <>
      <b>{location.name}</b>
      {"  "}
      {location.addressId && annotation.enable && (
        <>
          <span onClick={() => showModal(true)}>
            <Icon name="info circle" color="blue" />
          </span>
          <AddressInfoModal
            show={show}
            showModal={showModal}
            addressId={location.addressId}
            accountId={annotation.accountId}
            location={location}
          />
        </>
      )}
      <br />
      {address && <AddressFormat location={location} />}
      {locode && <LocationFormat location={location} />}
      {!address && !locode && <SimpleFormat location={location} />}
    </>
  );
};

LocationTag.propTypes = {
  location: LocationType,
  annotation: PropTypes.shape({
    enable: PropTypes.bool,
    accountId: PropTypes.string
  }),
  options: PropTypes.shape({
    lines: PropTypes.number // still to do
  })
};

export default LocationTag;
