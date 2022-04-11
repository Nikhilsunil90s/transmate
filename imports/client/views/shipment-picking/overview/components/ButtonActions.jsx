import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";

/** @param {{shipmentId: string; shipmentStatus: string; pickingStatus: string, onCancel: Function, onPrint:Function}} param0 */
const ButtonActions = ({ shipmentId, shipmentStatus, pickingStatus, onCancel, onPrint }) => {
  const { t } = useTranslation();
  const handleCancel = () => onCancel(shipmentId);
  const handlePrint = () => onPrint(shipmentId);

  return (
    <Button.Group>
      <Button
        as="a"
        href={`/pack/${shipmentId}`}
        icon="clipboard check"
        content={t("picking.overview.actions.pack")}
      />
      <Button
        primary
        onClick={handlePrint}
        icon="print"
        content={t("picking.overview.actions.print")}
      />
      {["printed"].includes(pickingStatus) && ["draft", "planned"].includes(shipmentStatus) && (
        <Button
          negative
          onClick={handleCancel}
          icon="cancel"
          content={t("picking.overview.actions.cancelLabels")}
        />
      )}
    </Button.Group>
  );
};

export default ButtonActions;
