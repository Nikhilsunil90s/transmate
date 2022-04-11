/* eslint-disable no-use-before-define */
import React from "react";
import { useTranslation } from "react-i18next";
import pick from "lodash.pick";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SelectField from "../../../../components/forms/uniforms/SelectField";

import { AccountContactSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_account-contact";
import { ModalComponent } from "../../../../components/modals/Modal";
import { ModalActions } from "../../../../components/modals/modalActions";
import PhoneField from "../../../../components/forms/uniforms/PhoneInput.jsx";

const contactTypes = ["general", "booking", "sales", "other"];

const ContactSchema = AccountContactSchema.pick(
  "contactType",
  "firstName",
  "lastName",
  "mail",
  "phone"
);

export const ContactForm = ({ data = {}, onSave }) => {
  const { t } = useTranslation();
  const onSubmitForm = formData => {
    onSave(formData);
  };

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(ContactSchema)}
      model={data}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="contactType"
        label={t("account.profile.contacts.type")}
        fluid
        options={contactTypes.map(type => ({
          value: type,
          text: t(`account.profile.contacts.types.${type}`)
        }))}
        placeholder={t("form.select")}
      />
      <Form.Group widths="equal">
        <AutoField name="firstName" label={t("account.profile.contacts.firstName")} />
        <AutoField name="lastName" label={t("account.profile.contacts.lastName")} />
      </Form.Group>
      <Form.Group widths="equal">
        <AutoField name="mail" label={t("account.profile.contacts.mail")} />
        <PhoneField name="phone" label={t("account.profile.contacts.phone")} enableSearch />
      </Form.Group>
    </AutoForm>
  );
};

let formRef;
const ContactModal = ({ data, onSave: onSaveContact, show, showModal }) => {
  const { t } = useTranslation();
  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = formData => {
    onSaveContact(pick(formData, ["type", "title", "firstName", "lastName", "mail", "phone"]));
    showModal(false);
  };

  const title = data ? t(`account.profile.contacts.edit`) : t(`account.profile.contacts.add`);
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<ContactForm {...{ data, onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    />
  );
};

export default ContactModal;
