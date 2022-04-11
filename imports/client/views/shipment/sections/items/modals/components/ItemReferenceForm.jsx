import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

export const ItemReferenceForm = ({ value = {}, security }) => {
  const { t } = useTranslation();
  const { type } = value;
  const disabled = !security.canEditItems && !security.canEditItemReferences;
  return (
    <>
      <Form.Group widths="equal">
        <AutoField
          name="references.order"
          disabled={disabled}
          label={t("shipment.form.item.references.order")}
          placeholder={t("form.input")}
        />
        <AutoField
          name="references.delivery"
          disabled={disabled}
          label={t("shipment.form.item.references.delivery")}
          placeholder={t("form.input")}
        />
      </Form.Group>
      <Form.Group widths="two">
        <AutoField
          name="references.document"
          disabled={disabled}
          label={t("shipment.form.item.references.document")}
        />
      </Form.Group>
      {type === "TU" && (
        <Form.Field>
          <label>
            <Trans i18nKey="shipment.form.item.quantityType.TU" />
          </label>
          <Form.Group widths="equal">
            <AutoField
              name="references.containerNo"
              disabled={disabled}
              label={t("shipment.form.item.references.containerNo")}
              placeholder={t("form.input")}
            />
            <AutoField
              name="references.seal"
              disabled={disabled}
              label={t("shipment.form.item.references.seal")}
              placeholder={t("form.input")}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <AutoField
              name="references.truckId"
              disabled={disabled}
              label={t("shipment.form.item.references.truckId")}
              placeholder={t("form.input")}
            />
            <AutoField
              name="references.trailerId"
              disabled={disabled}
              label={t("shipment.form.item.references.trailerId")}
              placeholder={t("form.input")}
            />
          </Form.Group>
        </Form.Field>
      )}
    </>
  );
};
