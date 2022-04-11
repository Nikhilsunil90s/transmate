import React from "react";
import moment from "moment";
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
import DateTimeField from "/imports/client/components/forms/uniforms/DateInput";

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    title: String,
    details: String,
    date: Date
  })
);

let formRef;
const MileStoneForm = ({ model, onSubmit, isLocked }) => {
  const { t } = useTranslation();
  const formModel = {
    date: moment()
      .add(1, "week")
      .toDate(),
    ...model
  };
  return (
    <AutoForm
      model={formModel}
      disabled={isLocked}
      onSubmit={onSubmit}
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoField name="title" label={t("tender.milestone.title")} />
      <LongTextField name="details" label={t("tender.milestone.details")} />
      <DateTimeField name="date" label={t("tender.milestone.date")} />
    </AutoForm>
  );
};

//#endregion

const TenderMilestoneModal = ({ ...props }) => {
  const { show, index, isLocked, milestone, showModal, onSave, onDelete } = props;
  const title =
    index > -1 ? (
      <Trans i18nKey="tender.milestone.update" />
    ) : (
      <Trans i18nKey="tender.milestone.add" />
    );
  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={
        <MileStoneForm
          {...{
            isLocked,
            model: milestone,
            onSubmit: data => onSave(data, index)
          }}
        />
      }
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!milestone && (
            <ModalActionsDelete
              {...{ showModal, onSave: () => formRef.submit(), onDelete: () => onDelete(index) }}
            />
          )}
          {!isLocked && !milestone && (
            <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default TenderMilestoneModal;
