import PropTypes from "prop-types";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes";

export const stagePropTypes = {
  ...tabProptypes,
  stage: PropTypes.object,
  stageSecurity: PropTypes.object
};
