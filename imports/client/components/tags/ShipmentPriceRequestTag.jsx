import React from "react";
import { Icon } from "semantic-ui-react";

const ShipmentPriceRequestTag = ({ hasPriceRequest }) =>
  hasPriceRequest ? <Icon name="gavel" /> : null;

export default ShipmentPriceRequestTag;
