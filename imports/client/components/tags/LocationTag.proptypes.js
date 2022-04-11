import PropTypes from "prop-types";

// type checking:
export const addressLocationType = PropTypes.shape({
  street: PropTypes.string,
  number: PropTypes.string,
  bus: PropTypes.string,
  zipCode: PropTypes.string, // shipment location has zipCode
  zip: PropTypes.string, // address doc passes zip
  city: PropTypes.string
});

const locodeType = PropTypes.shape({
  code: PropTypes.string,
  function: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string
});

export const LocationType = PropTypes.shape({
  countryCode: PropTypes.string.isRequired,
  name: PropTypes.string,

  // for annotation map:
  addressId: PropTypes.string,
  latLng: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  address: addressLocationType,

  // locode:
  locode: locodeType
});
