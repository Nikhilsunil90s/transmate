/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { useTranslation } from "react-i18next";
import { AutoForm } from "uniforms-semantic";
import { SelectField } from "/imports/client/components/forms/uniforms";

import { ModalComponent } from "../Modal";
import { ModalActions } from "../modalActions";

let formRef;

const debug = require("debug")("modal:input");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    input: String
  })
);

const Form = ({ onSave, model, label, options = [] }) => {
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
      <SelectField
        name="input"
        label={label || "Input"}
        placeholder={t("form.select")}
        options={options}
      />
    </AutoForm>
  );
};

const SimpleDropdownModal = ({
  show,
  showModal,
  title,
  label,
  model,
  options,
  onSave: onSaveForm
}) => {
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
      body={<Form {...{ onSave: onSubmitForm, model, label, options }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    />
  );
};
export default SimpleDropdownModal;
