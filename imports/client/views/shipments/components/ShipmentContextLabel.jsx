import React from "react";
import PropTypes from "prop-types";
import { Label, Popup } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

const LABEL_MAP = {
  isPlanner: { color: "blue", icon: "pencil alternate" },
  isBidder: { color: "orange", icon: "gavel" },
  isCarrier: { color: "green", icon: "truck" },
  isPartner: { color: "grey", icon: "eye" }
};

const ShipmentContextLabel = ({ context }) => {
  const { t } = useTranslation();
  if (!context) return null;
  if (context === "isOwner") return null;
  const { color, icon } = LABEL_MAP[context];
  return (
    <Popup
      content={t(`shipments.context.${context}_info`)}
      trigger={<Label color={color} icon={icon} content={t(`shipments.context.${context}`)} />}
    />
  );
};

ShipmentContextLabel.propTypes = {
  context: PropTypes.oneOf(["isPlanner", "isBidder", "isCarrier", "isOwner", "isPartner"])
};

export default ShipmentContextLabel;
