import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import FileUpload from "/imports/client/components/forms/input/FileUpload.jsx";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    file: String // need to alter the validation method!!
  })
);

let formRef;
const FileForm = ({ onSubmitForm }) => (
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
    <FileUpload name="file" />
    <ErrorsField />
  </AutoForm>
);

const DocumentModal = ({ show, showModal, title, ...props }) => {
  return (
    <ModalComponent
      title={title}
      show={show}
      showModal={showModal}
      body={<FileForm {...props} />}
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit()
          }}
        />
      }
    />
  );
};

export default DocumentModal;
