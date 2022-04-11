import React from "react";
import SimpleSchema from "simpl-schema";
import { Trans, useTranslation } from "react-i18next";
import { AutoForm } from "uniforms-semantic";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import FileUpload from "/imports/client/components/forms/input/FileUpload.jsx";

import { SHIPMENT_DOCUMENT_TYPES } from "/imports/api/_jsonSchemas/enums/documents";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    type: String,
    file: String // need to alter the validation method!!
  })
);

let formRef;
const DocumentForm = ({ onSubmitForm }) => {
  const { t } = useTranslation();
  const docTypes = SHIPMENT_DOCUMENT_TYPES.map(type => ({
    key: type,
    value: type,
    text: t(`shipment.form.document.types.${type}`)
  }));

  return (
    <AutoForm
      schema={schema}
      modelTransform={(mode, model) => {
        if (mode === "validate") {
          const { name } = model.file || {};

          return {
            ...model,
            file: name
          };
        }
        return model;
      }}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="type"
        placeholder={t("form.select")}
        options={docTypes}
        label={t("reporting.download.reportId")}
      />
      <FileUpload name="file" />
    </AutoForm>
  );
};

const ShipmentDocumentModal = ({ show, showModal, ...props }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.form.document.title" />}
      show={show}
      showModal={showModal}
      body={<DocumentForm {...props} />}
      actions={
        <ModalActions
          {...{
            showModal,
            saveLabel: t("shipment.form.document.save"),
            onSave: () => formRef.submit()
          }}
        />
      }
    />
  );
};

export default ShipmentDocumentModal;
