/* eslint-disable no-use-before-define */
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, AutoField, BoolField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

import initializeModal from "/imports/client/components/modals/Modal";
import { ModalActions } from "/imports/client/components/modals/modalActions.jsx";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    user: Object,
    "user.email": String,
    "user.first": String,
    "user.last": String,
    options: Object,
    "options.sendMail": Boolean
  })
);

let formRef;
const UserForm = ({ onSave, user }) => {
  const { t } = useTranslation();
  const model = { options: { sendMail: true }, data: { ...user } };

  const onSubmitForm = data => onSave(data);

  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Field>
        <label>
          <Trans i18nKey="settings.users.modal.name" />
        </label>
        <Form.Group widths={2}>
          <AutoField name="user.first" label={t("settings.users.modal.firstName")} />
          <AutoField name="user.last" label={t("settings.users.modal.lastName")} />
        </Form.Group>
      </Form.Field>
      <AutoField name="user.email" label={t("settings.users.modal.email")} />

      <BoolField name="options.sendMail" label={t("settings.users.modal.sendEmail")} />
    </AutoForm>
  );
};

const UserModal = ({ user, onSave, children: trigger }) => {
  const { ModalTrigger, showModal } = initializeModal();

  const submit = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ user: updatedUser, options }) => {
    onSave({ user: updatedUser, options }, () => showModal(false));
  };

  return (
    <ModalTrigger
      title={<Trans i18nKey="settings.users.modal.title" />}
      body={<UserForm {...{ user, onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave: submit, showModal }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

export default UserModal;
