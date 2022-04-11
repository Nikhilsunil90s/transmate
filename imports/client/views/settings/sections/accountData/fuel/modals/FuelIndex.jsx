import React from "react";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Form } from "semantic-ui-react";
import { SelectField } from "/imports/client/components/forms/uniforms";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledField.jsx";
import { AutoForm, AutoField, LongTextField } from "uniforms-semantic";
import { FuelIndexSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/fuel-index";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";

const schema = new SimpleSchema2Bridge(
  FuelIndexSchema.pick("name", "base", "fuel", "acceptance", "description")
);

const buildRange = (count, add = 0) => Array.from(Array(count).keys()).map(item => item + add);

const START_YEAR = new Date().getFullYear() - 8;

let formRef;
const IndexForm = ({ onSubmitForm, fuelIndex }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={schema}
      model={fuelIndex}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoField name="name" label={t("settings.fuel.index.name")} />
      <Form.Group widths={2}>
        <Form.Field>
          <label>
            <Trans i18nKey="settings.fuel.index.basePeriod" />
          </label>
          <Form.Group widths={2}>
            <SelectField
              name="base.month"
              placeholder={t("settings.fuel.index.month")}
              allowedValues={buildRange(12, 1)}
            />
            <SelectField
              name="base.year"
              placeholder={t("settings.fuel.index.year")}
              allowedValues={buildRange(10, START_YEAR)}
            />
          </Form.Group>
        </Form.Field>
        <LabeledField name="fuel" inputLabel="%" label={t("settings.fuel.index.fuel")} />
      </Form.Group>
      <Form.Group widths={2}>
        <LabeledField name="base.rate" inputLabel="%" label={t("settings.fuel.index.base")} />
        <LabeledField
          name="acceptance"
          inputLabel="%"
          label={t("settings.fuel.index.acceptance")}
        />
      </Form.Group>
      <LongTextField name="description" label={t("settings.fuel.index.description")} />
    </AutoForm>
  );
};

const FuelIndexModal = ({ fuelIndex, onSave, show, showModal }) => {
  const onSubmitForm = formData => {
    onSave(formData);
  };

  const title = fuelIndex ? (
    <Trans i18nKey="settings.fuel.modal.edit" />
  ) : (
    <Trans i18nKey="settings.fuel.modal.add" />
  );

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<IndexForm {...{ fuelIndex, onSubmitForm }} />}
      actions={<ModalActions {...{ onSave: () => formRef.submit(), showModal }} />}
    />
  );
};

FuelIndexModal.propTypes = {
  fuelIndex: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired
};

export default FuelIndexModal;
