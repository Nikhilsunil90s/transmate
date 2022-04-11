import PropTypes from "prop-types";

export const tabPropTypes = {
  importId: PropTypes.string.isRequired,
  imp: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mapping: PropTypes.object,
    progress: PropTypes.object,
    totals: PropTypes.object,
    headers: PropTypes.arrayOf(PropTypes.string)
  }),
  setActiveStep: PropTypes.func.isRequired
};
