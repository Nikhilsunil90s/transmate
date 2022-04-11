import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import {
  ModalActionsClose,
  ModalActions,
  ModalActionsDelete,
  ModalComponent
} from "/imports/client/components/modals";
import { AutoForm } from "uniforms-semantic";
import { SelectField } from "/imports/client/components/forms/uniforms";

import { CONTACT_TYPES } from "/imports/api/_jsonSchemas/enums/tender";
import { GET_ACCOUNT_CONTACTS_QUERY } from "/imports/client/views/tender/utils/queries";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("tender:UI");

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    userId: String,
    role: { type: String, allowedValues: CONTACT_TYPES }
  })
);

let formRef;
const ContactForm = ({ model, onSubmit, isLocked, isMyself }) => {
  const { t } = useTranslation();
  const { accountId } = useContext(LoginContext);
  const { data = {}, loading, error } = useQuery(GET_ACCOUNT_CONTACTS_QUERY, {
    variables: {
      accountId,
      roles: ["core-tender-update", "core-tender-create"]
    },
    fetchPolicy: "no-cache"
  });
  if (error) console.error(error);

  debug("contact data from apollo", { data, loading, error });

  const userOptions = (data.users || []).map(({ id, name, email }) => ({
    key: id,
    value: id,
    text: (
      <>
        {name}
        {" - "}
        <span style={{ opacity: "0.5" }}>{email}</span>
      </>
    )
  }));

  return (
    <AutoForm
      model={model}
      disabled={isLocked}
      onSubmit={onSubmit}
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="userId"
        options={userOptions}
        loading={loading}
        label={t("tender.contact.name")}
        disabled={isMyself || isLocked}
      />
      <SelectField
        name="role"
        label={t("tender.contact.role")}
        transform={role => t(`tender.contact.roles.${role}`)}
      />
    </AutoForm>
  );
};
//#endregion

const TenderifyContactModal = ({ ...props }) => {
  const { userId } = useContext(LoginContext);
  const { show, index, isLocked, contact, showModal, onSave, onDelete } = props;
  const title =
    index > -1 ? <Trans i18nKey="tender.contact.update" /> : <Trans i18nkey="tender.contact.add" />;

  const isMyself = contact?.userId === userId;
  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={
        <ContactForm
          {...{
            isLocked,
            model: contact,
            onSubmit: data => onSave(data),
            isMyself
          }}
        />
      }
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!contact && !isMyself && (
            <ModalActionsDelete
              {...{ showModal, onSave: () => formRef.submit(), onDelete: () => onDelete(index) }}
            />
          )}
          {!isLocked && !contact && (
            <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default TenderifyContactModal;
