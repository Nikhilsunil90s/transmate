import React from "react";
import { string } from "prop-types";
import { Icon, Popup } from "semantic-ui-react";
import capitalize from "lodash.capitalize";

const ShipmentStatusTableCell = ({ status }) => {
  let indicatorColor;
  let icon;

  switch (status) {
    case "draft":
      indicatorColor = "yellow";
      icon = "boxes";
      break;
    case "planned":
      indicatorColor = "blue";
      icon = "sign in alternate";
      break;
    case "started":
      indicatorColor = "grey";
      icon = "shipping fast";
      break;
    case "completed":
      indicatorColor = "olive";
      icon = "flag checkered";
      break;
    default:
      indicatorColor = "red";
      icon = "empty horizontal circular";
      break;
  }
  if (!status) {
    return null;
  }

  return (
    <Popup content={capitalize(status)} trigger={<Icon name={icon} color={indicatorColor} />} />
  );
};

ShipmentStatusTableCell.propTypes = {
  status: string
};

export default ShipmentStatusTableCell;
