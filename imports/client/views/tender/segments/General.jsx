import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField } from "uniforms-semantic";
import { SegmentToggleEditFooter } from "/imports/client/components/utilities/IconSegment.jsx";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { RichTextField } from "/imports/client/components/forms/uniforms/RichTextEditor.jsx";
import { serializeSlateString } from "/imports/client/components/forms/uniforms/RichText.utils";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    title: String,
    notes: { type: String, optional: true }
  })
);

function initSlate(notes) {
  let res;
  try {
    res = !!notes ? JSON.parse(notes) : undefined;
  } catch (err) {
    console.error(err);
  }
  return res;
}

let formRef;
const GeneralForm = ({ data = {}, onSave }) => {
  const { t } = useTranslation();
  const modelData = {
    ...data,
    notes: initSlate(data.notes)
  };

  function onSaveForm({ notes, title }) {
    onSave({
      title,
      notes: {
        general: notes
      }
    });
  }
  return (
    <AutoForm
      schema={schema}
      model={modelData}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSaveForm}
      modelTransform={(mode, model = {}) => {
        // This model will be submitted.
        if (mode === "submit") {
          return {
            ...model,
            notes: JSON.stringify(model.notes)
          };
        }

        // This model will be validated.
        if (mode === "validate") {
          return {
            ...model,
            notes: JSON.stringify(model.notes)
          };
        }

        // Otherwise, return unaltered model.
        return model;
      }}
    >
      <AutoField name="title" label={t("tender.title")} />
      <RichTextField name="notes" label={t("tender.introduction")} />
    </AutoForm>
  );
};

const TenderGeneral = ({ tender = {}, security = {}, onSave }) => {
  const [isEditing, toggleEditing] = useState(false);

  const saveData = update => {
    onSave(update, () => toggleEditing(false));
  };

  return (
    <IconSegment
      name="general"
      icon="file outline"
      title={<Trans i18nKey="tender.introduction" />}
      body={
        isEditing ? (
          <GeneralForm
            onSave={saveData}
            data={{ title: tender.title, notes: tender.notes?.introduction }}
          />
        ) : (
          <form className="ui form">
            <div className="field">
              <label>
                <Trans i18nKey="tender.title" />
              </label>
              <p data-test="tenderTitle">{tender.title}</p>
            </div>

            {tender.notes?.introduction && (
              <div className="field">
                <label>
                  <Trans i18nKey="tender.introduction" />
                </label>
                {serializeSlateString(tender.notes.introduction)}
              </div>
            )}
          </form>
        )
      }
      footerElement={
        security.canEditGeneral && (
          <SegmentToggleEditFooter
            {...{ isEditing, toggleEditing, onSave: () => formRef.submit() }}
          />
        )
      }
    />
  );
};

export default TenderGeneral;
