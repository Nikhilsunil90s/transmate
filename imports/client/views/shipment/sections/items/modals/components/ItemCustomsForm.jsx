import React from "react";
import { useTranslation } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { DropdownCountryFlagField } from "/imports/client/components/forms/uniforms";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledInputField";
import { Form } from "semantic-ui-react";
import { currencyOptions } from "/imports/client/components/forms/uniforms/CurrencySelect";

const CURRENCY_DEFAULT = "EUR";

// fields:
// customs.HScode; customs.value; customs.currency
// customs.countryOfOrigin
export const ItemCustomsForm = ({ security }) => {
  const { t } = useTranslation();
  const disabled = !security.canEditItems;

  return (
    <>
      <Form.Group>
        <AutoField
          name="customs.HScode"
          disabled={disabled}
          label={t("shipment.form.item.customs.HScode")}
          className="six wide"
        />
        <DropdownCountryFlagField
          name="customs.countryOfOrigin"
          disabled={disabled}
          label={t("shipment.form.item.customs.countryOfOrigin")}
          className="ten wide"
        />
      </Form.Group>
      <Form.Group>
        <LabeledField
          type="number"
          disabled={disabled}
          placeholder={t("form.quantity")}
          inputName="customs.value"
          label={t("shipment.form.item.customs.value")}
          dropdownName="customs.currency"
          dropdownOptions={currencyOptions}
          dropdownDefaultValue={CURRENCY_DEFAULT}
        />
      </Form.Group>
    </>
  );
};
