/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import SimpleSchema from "simpl-schema";
import { useTranslation } from "react-i18next";
import { AutoForm, AutoField } from "uniforms-semantic";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ModalComponent } from "../Modal";
import { ModalActions } from "../modalActions";

let formRef;

const debug = require("debug")("modal:input");

const SimpleInputModal = ({ show, showModal, title, label, model, onSave: onSaveForm }) => {
  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ input }) => {
    debug("save input %s", input);
    onSaveForm({ input });
  };

  return (
    <ModalComponent
      show={show}
      title={title}
      body={<Form {...{ onSave: onSubmitForm, model, label }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    />
  );
};

const Form = ({ onSave, model, label }) => {
  const { t } = useTranslation();

  // eslint-disable-next-line no-unused-vars
  const [data, setRefData] = useState([]);
  const onSubmitForm = ({ input }) => {
    onSave({ input });
  };

  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoField name="input" label={label || "Input"} placeholder={t("form.input")} />
    </AutoForm>
  );
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    input: String
  })
);

export default SimpleInputModal;
