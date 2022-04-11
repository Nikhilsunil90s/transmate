import React from "react";

import { Trans } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { Button, Loader } from "semantic-ui-react";
import { AutoForm } from "uniforms-semantic";
import { IconSegment } from "../../../components/utilities/IconSegment";
import { RichTextField } from "/imports/client/components/forms/uniforms/RichTextEditor.jsx";

//#region components
let formRef;
const NotesForm = ({ priceRequest: { id, notes }, onSave, canEditNote }) => {
  const modelData = { notes: !!notes ? JSON.parse(notes) : undefined };
  const saveNotes = ({ notes: updatedNotes }) => {
    if (!canEditNote || !updatedNotes) return;
    onSave({ update: { notes: updatedNotes } });
  };

  return id ? (
    <AutoForm
      ref={ref => {
        formRef = ref;
      }}
      style={{ height: 600 }}
      schema={new SimpleSchema2Bridge(new SimpleSchema({ notes: String }))}
      model={modelData}
      onSubmit={saveNotes}
      modelTransform={(mode, model) => {
        // This model will be submitted.
        if (mode === "submit") {
          return { notes: JSON.stringify(model.notes) };
        }

        // This model will be validated.
        if (mode === "validate") {
          return { notes: JSON.stringify(model.notes) };
        }

        // Otherwise, return unaltered model.
        return model;
      }}
    >
      <RichTextField name="notes" style={{ height: 200 }} disabled={!canEditNote} />
    </AutoForm>
  ) : (
    <Loader />
  );
};
//#endregion

const PriceRequestNotes = ({ onSave, priceRequest = {}, security = {} }) => {
  const canEditNote = security.canEditMasterNote;

  const onSaveFooter = () => {
    formRef.submit();
  };

  const segmentData = {
    name: "notes",
    icon: "file outline",
    title: <Trans i18nKey="price.request.tab.notes" />,
    body: <NotesForm {...{ canEditNote, onSave, priceRequest }} />,
    ...(canEditNote
      ? {
          footer: (
            <Button
              primary
              icon="save"
              content={<Trans i18nKey="form.save" />}
              onClick={onSaveFooter}
            />
          )
        }
      : undefined)
  };

  return <IconSegment {...segmentData} />;
};

export default PriceRequestNotes;
