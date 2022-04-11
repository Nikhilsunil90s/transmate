import PropTypes from "prop-types";

export const tabPropTypes = {
  priceRequestId: PropTypes.string,
  priceRequest: PropTypes.object,
  security: PropTypes.object,
  onSave: PropTypes.func,
  refreshData: PropTypes.func
};
