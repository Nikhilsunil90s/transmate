import PropTypes from "prop-types";

export const conversionType = {
  from: PropTypes.shape({
    uom: PropTypes.string,
    range: PropTypes.shape({
      from: PropTypes.number,
      to: PropTypes.number
    })
  }),
  to: PropTypes.shape({
    uom: PropTypes.string,
    multiplier: PropTypes.number,
    fixed: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  })
};
