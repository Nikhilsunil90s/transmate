import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm } from "uniforms-semantic";
import { Message } from "semantic-ui-react";
import { ModalComponent } from "/imports/client/components/modals";
import ModalActions from "/imports/client/components/modals/modalActions";

import DateTimeField from "/imports/client/components/forms/uniforms/DateInput";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

let formRef;

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    dueDate: {
      type: Date
    }
  })
);
const Form = ({ dueDate, onSave }) => {
  const { t } = useTranslation();

  return (
    <AutoForm
      schema={schema}
      model={{ dueDate }}
      onSubmit={onSave}
      ref={ref => {
        formRef = ref;
      }}
    >
      <DateTimeField
        name="dueDate"
        placeholder={t("form.date")}
        label={t("price.request.form.due")}
      />
    </AutoForm>
  );
};

const PostponeDeadlineModal = ({ show, showModal, onSave, dueDate }) => {
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="price.request.settings.postpone.title" />}
      body={
        <>
          <Message info content={<Trans i18nKey="price.request.settings.postpone.message" />} />
          <Form dueDate={dueDate} onSave={onSave} />
        </>
      }
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
      data-test="modal"
    />
  );
};

export default PostponeDeadlineModal;
