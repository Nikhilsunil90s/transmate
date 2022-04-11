import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Divider, Form } from "semantic-ui-react";
import { AutoForm, LongTextField } from "uniforms-semantic";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { NonConformanceSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/non-conformance";
import { DateTimeField } from "/imports/client/components/forms/uniforms";

let formRef;

const schema = new SimpleSchema2Bridge(NonConformanceSchema.pick("reasonCode", "comment", "date"));

const DEFAULT_MODEL = {
  date: new Date()
};

const NonConformanceForm = ({ model = DEFAULT_MODEL, onSubmitForm }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <DateTimeField name="date" />
      <Divider />

      <h4>
        <Trans i18nKey="shipment.form.nonConformance.reasonCode" />
      </h4>
      <Form.Group widths={2}>
        <SelectField
          name="reasonCode.event"
          label={t("shipment.form.nonConformance.event.label")}
          placeholder={t("shipment.form.nonConformance.event.text")}
          transform={item => `${item} (${t(`nonConformance.reasonCode.event.${item}`)} )`}
        />
        <SelectField
          name="reasonCode.reason"
          label={t("shipment.form.nonConformance.reason.label")}
          placeholder={t("shipment.form.nonConformance.reason.text")}
          search
          transform={item => `${item} ${t(`nonConformance.reasonCode.reason.${item}`)}`}
        />
      </Form.Group>
      <Form.Group widths={2}>
        <SelectField
          name="reasonCode.owner"
          label={t("shipment.form.nonConformance.owner.label")}
          placeholder={t("shipment.form.nonConformance.owner.text")}
          transform={item => `${item} ${t(`nonConformance.reasonCode.owner.${item}`)}`}
        />
        <SelectField
          name="reasonCode.occurance"
          label={t("shipment.form.nonConformance.occurance.label")}
          placeholder={t("shipment.form.nonConformance.occurance.text")}
          transform={item => `${item} ${t(`nonConformance.reasonCode.occurance.${item}`)}`}
        />
      </Form.Group>

      <LongTextField name="comment" label={t("shipment.form.nonConformance.comment")} />
    </AutoForm>
  );
};

const NonConformanceModal = ({ show, showModal, nonConformance, onSaveForm }) => {
  const onSave = () => formRef.submit();

  const title = nonConformance ? (
    <Trans i18nKey="shipment.form.nonConformance.title.edit" />
  ) : (
    <Trans i18nKey="shipment.form.nonConformance.title.add" />
  );
  return (
    <ModalComponent
      show={show}
      title={title}
      body={<NonConformanceForm {...{ onSubmitForm: onSaveForm, model: nonConformance }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    />
  );
};

export default NonConformanceModal;
