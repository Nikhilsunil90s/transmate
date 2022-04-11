import React from "react";
import { Popup, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

const ButtonTooltip = ({ tooltip, ...props }) => (
  <Popup content={tooltip} trigger={<Button {...props} />} />
);

ButtonTooltip.propTypes = {
  trigger: PropTypes.element,
  tooltip: PropTypes.string
};

export default ButtonTooltip;
