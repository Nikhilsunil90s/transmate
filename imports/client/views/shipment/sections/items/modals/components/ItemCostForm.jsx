import React from "react";
import { Trans } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { Icon, Popup } from "semantic-ui-react";
import { ItemTaxableBlock } from "./ItemTaxableBlock";

export const ItemCostForm = ({ value, taxableOptions, onChangeTaxable, security }) => {
  const taxableValue = { taxable: [], calcSettingsKeys: {} };
  const disabled = !security.canEditItems;
  if (value && value.taxable) {
    taxableValue.taxable = value.taxable;
  }
  if (value && value.calcSettings && value.calcSettings.keys) {
    taxableValue.calcSettingsKeys = value.calcSettings.keys;
  }

  return (
    <>
      <AutoField
        name="calcSettings.costRelevant"
        disabled={disabled}
        label={
          <>
            {<Trans i18nKey="shipment.form.item.calcSettings.costRelevant" />}{" "}
            <Popup
              content={<Trans i18nKey="shipment.form.item.calcSettings.costRelevantInfo" />}
              trigger={<Icon name="question circle" color="blue" />}
            />
          </>
        }
      />

      <AutoField
        name="calcSettings.itemize"
        disabled={disabled}
        label={
          <>
            <Trans i18nKey="shipment.form.item.calcSettings.itemize" />
            <Popup
              content={<Trans i18nKey="shipment.form.item.calcSettings.itemizeInfo" />}
              trigger={<Icon name="question circle" color="blue" />}
            />
          </>
        }
      />
      <ItemTaxableBlock
        value={taxableValue}
        security={security}
        onChange={onChangeTaxable}
        options={taxableOptions}
      />
    </>
  );
};
