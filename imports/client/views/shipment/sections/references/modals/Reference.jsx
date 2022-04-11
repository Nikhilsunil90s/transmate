import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

import { SHIPMENT_REFERENCE_TYPES } from "/imports/api/_jsonSchemas/enums/shipment.js";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

let formRef;

const schema = new SimpleSchema2Bridge(new SimpleSchema({ type: String, ref: String }));

const ReferenceForm = ({ model, onSubmitForm }) => {
  const { t } = useTranslation();
  const refOptions = SHIPMENT_REFERENCE_TYPES.map(type => ({
    value: type,
    text: t(`shipment.references.${type}`)
  }));
  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group>
        <Form.Field width={6}>
          <SelectField
            name="type"
            fluid
            options={refOptions}
            label={t("shipment.form.reference.type")}
            placeholder={t("shipment.form.reference.type")}
          />
        </Form.Field>
        <Form.Field width={10}>
          <AutoField name="ref" label={t("shipment.form.reference.value")} />
        </Form.Field>
      </Form.Group>
      <ErrorsField />
    </AutoForm>
  );
};

const ReferenceModal = ({ show, showModal, reference, onSaveForm }) => {
  const onSave = () => formRef.submit();
  const title = reference ? (
    <Trans i18nKey="shipment.form.reference.title.edit" />
  ) : (
    <Trans i18nKey="shipment.form.reference.title.add" />
  );
  return (
    <ModalComponent
      show={show}
      title={title}
      body={<ReferenceForm {...{ onSubmitForm: onSaveForm, model: reference }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    />
  );
};

export default ReferenceModal;
