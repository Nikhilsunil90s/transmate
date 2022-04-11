import React from "react";
import { Icon } from "semantic-ui-react";

const ShipmentProjectTag = ({ hasProject }) => (hasProject ? <Icon name="beer" /> : null);

export default ShipmentProjectTag;
