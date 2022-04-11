import React from "react";
import { Trans } from "react-i18next";
import { AutoForm, LongTextField, ErrorsField } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { SelectField } from "/imports/client/components/forms/uniforms";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { ModalActionsClose } from "/imports/client/components/modals/modalActions";

const noteTypes = ["BookingNotes", "PlanningNotes", "LoadingNotes", "UnloadingNotes", "OtherNotes"];

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    type: String,
    text: String
  })
);

let formRef;
const NoteForm = ({ model, disabled, onSubmitForm }) => {
  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      disabled={disabled}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="type"
        allowedValues={noteTypes}
        transform={type => <Trans i18nKey={`shipment.notes.${type}`} />}
      />
      <LongTextField name="text" />
      <ErrorsField />
    </AutoForm>
  );
};

const ShipmentNotesModal = ({ show, showModal, note, isLocked, onSubmitForm }) => {
  const title = note ? (
    <Trans i18nKey="shipment.form.note.title.edit" />
  ) : (
    <Trans i18nKey="shipment.form.note.title.add" />
  );
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<NoteForm {...{ model: note, disabled: isLocked, onSubmitForm }} />}
      actions={
        isLocked ? (
          <ModalActionsClose {...{ showModal }} />
        ) : (
          <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
        )
      }
    />
  );
};

export default ShipmentNotesModal;
