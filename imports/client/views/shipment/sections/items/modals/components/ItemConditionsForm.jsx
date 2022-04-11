import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { Form, Header } from "semantic-ui-react";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledInputField";

import { TEMPERATURE_OPTIONS, TEMPERATURE_DEFAULT } from "/imports/api/_jsonSchemas/enums/units";

export const ItemConditionsForm = ({ security }) => {
  const { t } = useTranslation();
  const temperatureOptions = TEMPERATURE_OPTIONS.map(key => ({ key, text: key, value: key }));
  const disabled = !security.canEditItems;
  return (
    <>
      <Header as="h4" content="Dangerous Goods" />
      <br />

      <Form.Group>
        <AutoField
          name="DG"
          disabled={disabled}
          label={t("shipment.form.item.DG")}
          className="four wide"
        />
        <AutoField
          name="DGClassType"
          label={t("shipment.form.item.DGClassType")}
          disabled={disabled}
          placeholder={t("form.input")}
          className="twelve wide"
        />
      </Form.Group>

      <Header as="h4" content="Temperature control" />
      <br />
      <AutoField
        name="temperature.condition"
        placeholder={t("form.input")}
        disabled={disabled}
        label={t("shipment.form.item.temperature.condition")}
      />
      <label>
        <Trans i18nKey="shipment.form.item.temperature.range" />
      </label>
      <Form.Group label={t("shipment.form.item.temperature.range")}>
        <AutoField
          name="temperature.range.from"
          disabled={disabled}
          type="number"
          placeholder={t("form.quantity")}
        />
        <LabeledField
          type="number"
          disabled={disabled}
          placeholder={t("form.quantity")}
          inputName="temperature.range.to"
          label="to"
          dropdownName="temperature.range.unit"
          dropdownOptions={temperatureOptions}
          dropdownDefaultValue={TEMPERATURE_DEFAULT}
        />
      </Form.Group>
    </>
  );
};
