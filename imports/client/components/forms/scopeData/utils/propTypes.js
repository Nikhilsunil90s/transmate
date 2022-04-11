import PropTypes from "prop-types";

export const scopePropTypes = {
  type: PropTypes.oneOf(["tender", "simulation"]).isRequired,
  documentId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  query: PropTypes.shape({
    carrierId: PropTypes.string,
    mode: PropTypes.string,
    period: PropTypes.shape({
      from: PropTypes.instanceOf(Date),
      to: PropTypes.instanceOf(Date)
    })
  }),
  onSave: PropTypes.func,
  onSaveBulk: PropTypes.func
};
