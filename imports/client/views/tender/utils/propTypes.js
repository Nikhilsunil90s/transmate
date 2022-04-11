import PropTypes from "prop-types";

export const tabProptypes = {
  tenderId: PropTypes.string.isRequired,
  tender: PropTypes.object.isRequired,
  security: PropTypes.object,
  onSave: PropTypes.func,
  onSaveDetails: PropTypes.func,
  onSaveBid: PropTypes.func,
  refreshData: PropTypes.func,
  lastSave: PropTypes.instanceOf(Date)
};
