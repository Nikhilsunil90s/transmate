import React from "react";
import { useTranslation } from "react-i18next";
import { LongTextField } from "uniforms-semantic";

export const ItemNotesForm = ({ security }) => {
  const { t } = useTranslation();
  const disabled = !security.canEditItems;
  return (
    <>
      <LongTextField
        name="notes"
        disabled={disabled}
        label={t("shipment.form.item.notes")}
        rows={8}
      />
    </>
  );
};
