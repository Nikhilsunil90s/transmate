import PropTypes from "prop-types";

export const tabPropTypes = {
  projectId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  project: PropTypes.object,
  isLoading: PropTypes.bool,
  refetch: PropTypes.func
};
