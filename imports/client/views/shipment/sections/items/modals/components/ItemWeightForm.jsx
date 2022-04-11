import React from "react";
import { useTranslation } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledInputField";
import {
  WEIGHT_OPTIONS,
  WEIGHT_DEFAULT,
  DIMENSION_OPTIONS,
  DIMENSION_DEFAULT
} from "/imports/api/_jsonSchemas/enums/units";

export const ItemWeightForm = ({ security }) => {
  const { t } = useTranslation();
  const disabled = !security.canEditItems && !security.canEditWeights;
  const weightOptions = WEIGHT_OPTIONS.map(key => ({ key, text: key, value: key }));
  const dimensionOptions = DIMENSION_OPTIONS.map(key => ({ key, text: key, value: key }));
  return (
    <>
      <Form.Group>
        <AutoField
          placeholder={t("form.quantity")}
          name="weight_net"
          label={t("shipment.form.item.weight_net")}
          disabled={disabled}
          type="number"
        />
        <AutoField
          placeholder={t("form.quantity")}
          name="weight_tare"
          label={t("shipment.form.item.weight_tare")}
          disabled={disabled}
          type="number"
        />
        <LabeledField
          type="number"
          placeholder={t("form.quantity")}
          disabled={disabled}
          inputName="weight_gross"
          label={t("shipment.form.item.weight_gross")}
          dropdownName="weight_unit"
          dropdownOptions={weightOptions}
          dropdownDefaultValue={WEIGHT_DEFAULT}
        />
      </Form.Group>

      <Form.Group>
        <AutoField
          name="dimensions.length"
          placeholder={t("form.quantity")}
          label={t("shipment.form.item.dimensions.length")}
          disabled={disabled}
          type="number"
        />
        <AutoField
          name="dimensions.width"
          placeholder={t("form.quantity")}
          label={t("shipment.form.item.dimensions.width")}
          disabled={disabled}
          type="number"
        />
        <LabeledField
          type="number"
          disabled={disabled}
          placeholder={t("form.quantity")}
          inputName="dimensions.height"
          label={t("shipment.form.item.dimensions.height")}
          dropdownName="dimensions.uom"
          dropdownOptions={dimensionOptions}
          dropdownDefaultValue={DIMENSION_DEFAULT}
        />
      </Form.Group>
    </>
  );
};
