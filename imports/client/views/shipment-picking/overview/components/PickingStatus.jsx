import React from "react";
import { useTranslation } from "react-i18next";
import { Popup } from "semantic-ui-react";

const DEFAULT_COLOR = "red";
const PICKING_STATUS_COLORS = {
  none: "red",
  partial: "yellow",
  packed: "orange",
  printed: "green"
};

/**
 * @param {{status: "none" | "partial" | "packed" | "printed" }} param0
 */
const StatusRender = ({ status }) => {
  const { t } = useTranslation();
  const color = PICKING_STATUS_COLORS[status] || DEFAULT_COLOR;

  return (
    <Popup
      position="bottom left"
      className="tip"
      content={status ? t(`picking.detail.status.${status}`) : t("picking.detail.status.none")}
      trigger={
        <a data-test="pickingStatus">
          <span
            style={{ position: "relative", top: "2px" }}
            className={`ui ${color} empty horizontal circular label`}
          />
        </a>
      }
    />
  );
};

export default StatusRender;
