import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import { Header, Form } from "semantic-ui-react";
import { AccountEntitySchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/account-entity";
import DropdownCountryFlag from "/imports/client/components/forms/input/DropdownCountryFlag.jsx";
import { ModalComponent, ModalActions, ModalActionsClose } from "/imports/client/components/modals";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

let formRef;
export const EntityForm = ({ onSubmitForm, data = {}, isLocked, existingCodes = [] }) => {
  const { t } = useTranslation();
  const [uniqueCodeError, setError] = useState();

  return (
    <AutoForm
      error={uniqueCodeError}
      showInlineError
      schema={new SimpleSchema2Bridge(AccountEntitySchema)}
      onChange={(k, v) => {
        if (k === "code" && existingCodes.includes(v)) {
          setError("Code should be unique");
        }
        if (k === "code" && !existingCodes.includes(v)) {
          setError();
        }
      }}
      model={AccountEntitySchema.clean(data)}
      disabled={isLocked}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Header as="h4" dividing content={<Trans i18nKey="settings.entities.modal.nameGroup" />} />
      <Form.Group>
        <Form.Field width={4}>
          <AutoField name="code" label={t("settings.entities.code")} />
        </Form.Field>
        <Form.Field width={12}>
          <AutoField name="name" label={t("settings.entities.name")} />
        </Form.Field>
      </Form.Group>
      <Header
        as="h4"
        dividing
        content={<Trans i18nKey="settings.entities.modal.locationGroup" />}
      />
      <AutoField name="address" label={t("settings.entities.address")} />
      <Form.Group widths="equal">
        <Form.Field>
          <AutoField name="zipCode" label={t("settings.entities.zipCode")} />
        </Form.Field>
        <Form.Field>
          <AutoField name="city" label={t("settings.entities.city")} />
        </Form.Field>
      </Form.Group>
      <Form.Field width={6}>
        <DropdownCountryFlag name="country" label={t("settings.entities.country")} />
      </Form.Field>

      <Header as="h4" dividing content={t("settings.entities.modal.references")} />
      <Form.Group widths="equal">
        <Form.Field>
          <AutoField name="UID" label={t("settings.entities.UID")} />
        </Form.Field>
        <Form.Field>
          <AutoField name="registrationNumber" label={t("settings.entities.registrationNumber")} />
        </Form.Field>
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Field>
          <AutoField name="EORI" label={t("settings.entities.EORI")} />
        </Form.Field>
        <Form.Field>
          <AutoField name="VAT" label={t("settings.entities.VAT")} />
        </Form.Field>
      </Form.Group>

      <Header as="h4" dividing content={<Trans i18nKey="settings.entities.modal.contact" />} />
      <AutoField name="email" label={t("settings.entities.email")} />
      <ErrorsField />
    </AutoForm>
  );
};

const EntityModal = ({ show, showModal, data, onSubmitForm, isLocked, existingCodes }) => {
  const onSave = () => formRef.submit();

  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="settings.entities.modal.title" />}
      body={<EntityForm {...{ onSubmitForm, data, isLocked, existingCodes }} />}
      actions={
        isLocked ? (
          <ModalActionsClose {...{ showModal }} />
        ) : (
          <ModalActions {...{ onSave, showModal }} />
        )
      } // modalSubmitBtn created
    />
  );
};

export default EntityModal;
