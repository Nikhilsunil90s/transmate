import React from "react";
import { Trans } from "react-i18next";
import { Icon, Popup } from "semantic-ui-react";

const SHIPMENT_MODE_ICONS = {
  road: "truck",
  rail: "train",
  ocean: "ship",
  air: "plane"
};

const DEFAULT_ICON = "circle";

const ShipmentModeTag = ({ mode }) => (
  <Popup
    content={<Trans i18nKey={`general.modes.${mode}`} />}
    trigger={<Icon name={SHIPMENT_MODE_ICONS[mode] || DEFAULT_ICON} />}
  />
);

export default ShipmentModeTag;
