import PropTypes from "prop-types";

export const pagePropTypes = {
  tenderBidId: PropTypes.string.isRequired,
  tenderBid: PropTypes.object,
  security: PropTypes.object,
  onSave: PropTypes.func,
  onSaveDetails: PropTypes.func,
  onSaveBid: PropTypes.func,
  refreshData: PropTypes.func,
  lastSave: PropTypes.instanceOf(Date)
};

export const tabProptypes = {
  ...pagePropTypes,
  activeTab: PropTypes.string,
  selectTab: PropTypes.func,
  selectNextTab: PropTypes.func
};
