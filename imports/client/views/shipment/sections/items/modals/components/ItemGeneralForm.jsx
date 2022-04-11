import React from "react";
import { useTranslation } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

export const ItemGeneralForm = ({ security }) => {
  const { t } = useTranslation();
  const disabled = !security.canEditItems;
  return (
    <>
      <Form.Group>
        <AutoField
          name="number"
          disabled={disabled}
          label={t("shipment.form.item.number")}
          className="four wide"
        />
        <AutoField
          name="description"
          disabled={disabled}
          label={t("shipment.form.item.description")}
          className="twelve wide"
        />
      </Form.Group>
      <Form.Field>
        <label>Material</label>
        <Form.Group>
          <AutoField
            name="material.id"
            disabled={disabled}
            label={t("shipment.form.item.number")}
            className="four wide"
          />
          <AutoField
            name="material.description"
            disabled={disabled}
            label={t("shipment.form.item.description")}
            className="twelve wide"
          />
        </Form.Group>
      </Form.Field>
      <Form.Group>
        <AutoField
          name="commodity"
          disabled={disabled}
          label={t("shipment.form.item.commodity")}
          className="six wide"
        />
      </Form.Group>
    </>
  );
};
