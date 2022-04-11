import PropTypes from "prop-types";

export const tabProptypes = {
  partnerId: PropTypes.string,
  partner: PropTypes.object,
  security: PropTypes.object,
  onSave: PropTypes.func,
  refetch: PropTypes.func
};
