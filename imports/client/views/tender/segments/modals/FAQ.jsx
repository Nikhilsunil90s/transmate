import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import {
  ModalActionsClose,
  ModalActions,
  ModalActionsDelete,
  ModalComponent
} from "/imports/client/components/modals";
import { AutoForm, AutoField, LongTextField } from "uniforms-semantic";

//#region components

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    title: String,
    details: String
  })
);

let formRef;
const FAQForm = ({ model, onSubmit, isLocked }) => {
  const { t } = useTranslation();
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
      <AutoField name="title" label={t("tender.FAQ.title")} />
      <LongTextField name="details" label={t("tender.FAQ.details")} />
    </AutoForm>
  );
};

//#endregion

const TenderFAQModal = ({ ...props }) => {
  const { show, index, isLocked, item, showModal, onSave, onDelete } = props;
  const title =
    index > -1 ? <Trans i18nKey="tender.FAQ.edit" /> : <Trans i18nKey="tender.FAQ.add" />;
  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={
        <FAQForm
          {...{
            isLocked,
            model: item,
            onSubmit: data => onSave(data, index)
          }}
        />
      }
      actions={
        <>
          {!!isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!item && (
            <ModalActionsDelete
              {...{ showModal, onSave: () => formRef.submit(), onDelete: () => onDelete(index) }}
            />
          )}
          {!isLocked && !item && (
            <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default TenderFAQModal;
