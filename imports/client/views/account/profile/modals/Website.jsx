/* eslint-disable no-use-before-define */
import React from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SelectField from "../../../../components/forms/uniforms/SelectField";

import initializeModal from "../../../../components/modals/Modal";
import { ModalActions } from "../../../../components/modals/modalActions";

const contactTypes = ["general", "booking", "sales", "other"];

let formRef;
const WebsiteModal = ({ data, onSave: onSaveContact, children: trigger }) => {
  const { t } = useTranslation();
  const { ModalTrigger, showModal } = initializeModal();

  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = formData => {
    onSaveContact(formData);
    showModal(false);
  };

  const title = data ? t("account.profile.websites.edit") : t("account.profile.websites.add");

  return (
    <ModalTrigger
      title={title}
      body={<WebsiteForm {...{ data, onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

export const WebsiteForm = ({ data = {}, onSave }) => {
  const { t } = useTranslation();
  const onSubmitForm = formData => {
    onSave(formData);
  };

  return (
    <AutoForm
      model={data}
      schema={schema}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths="equal">
        <SelectField fluid name="name" label={t("account.profile.websites.name")} />
        <AutoField name="url" label={t("account.profile.websites.url")} />
      </Form.Group>
    </AutoForm>
  );
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    name: {
      type: String,
      allowedValues: contactTypes
    },
    url: {
      type: String,
      optional: true
    }
  })
);

export default WebsiteModal;
