import PropTypes from "prop-types";

export const costTableSecurity = {
  canViewCostLabel: PropTypes.func.isRequired,
  canApproveDecline: PropTypes.func.isRequired,
  canRemoveManualCost: PropTypes.func.isRequired
};
