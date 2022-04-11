import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AutoForm, AutoField, LongTextField, BoolField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { ConversationSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/conversations";
import { SelectField } from "/imports/client/components/forms/uniforms";

const schema = new SimpleSchema2Bridge(
  ConversationSchema.pick("subject", "participants", "participants.$", "broadcast").extend({
    message: { type: String, optional: true }
  })
);

let formRef;
const ConversationForm = ({ reference, onSave }) => {
  const { t } = useTranslation();
  const { participants } = reference;
  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSave}
    >
      <AutoField name="subject" label={t("conversations.modal.subject")} />
      {participants?.length > 0 && (
        <SelectField name="participants" multiple allowedValues={participants} />
      )}
      <LongTextField name="message" label={t("conversations.modal.message")} />
      <BoolField name="broadcast" label={t("conversations.modal.broadcast")} />
    </AutoForm>
  );
};

const ConversationModal = ({ show, showModal, reference, onSave }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      size="large"
      show={show}
      showModal={showModal}
      title={t("conversations.modal.title")}
      body={<ConversationForm reference={reference} onSave={onSave} />}
      actions={
        <ModalActions
          {...{
            showModal,
            saveLabel: t("conversations.modal.submit"),
            onSave: () => formRef.submit()
          }}
        />
      }
    />
  );
};

ConversationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  reference: PropTypes.shape({
    participants: PropTypes.arrayOf(PropTypes.string),
    documentType: PropTypes.string,
    documentId: PropTypes.string
  })
};

export default ConversationModal;
