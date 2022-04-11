import React from "react";
import { Trans } from "react-i18next";
import { Icon, Popup } from "semantic-ui-react";

const SHIPMENT_FLAG_ICONS = {
  "has-costs": "dollar sign",
  "has-invoice": "file alternate outline",
  "approve-costs": "hand point up outline",
  "tracking-failed": "low vision",
  "eta-late": "low vision",
  late: "fire"
};

const DEFAULT_ICON = "info";

const ShipmentFlag = ({ flag }) => (
  <Popup
    content={<Trans i18nKey={`shipment.flag.${flag}`} />}
    trigger={<Icon name={SHIPMENT_FLAG_ICONS[flag] || DEFAULT_ICON} />}
  />
);

export default ShipmentFlag;
