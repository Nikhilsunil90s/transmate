import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import {
  RichTextEditor,
  initSlateValue,
  serializeSlateString
} from "/imports/client/components/forms/uniforms";

export const AddressHours = ({ annotation }) => {
  return annotation.hours ? (
    serializeSlateString(annotation.hours)
  ) : (
    <Trans i18nKey="address.form.hours.empty" />
  );
};

const AddressHoursSegment = ({ annotation = {}, canEdit, onSave }) => {
  const { t } = useTranslation();
  const [isEditing, setEditing] = useState(false);
  const [notes, setNotesData] = useState(initSlateValue(annotation.hours));
  const triggerSave = () => {
    onSave({ hours: JSON.stringify(notes) }, () => setEditing(false));
  };
  return (
    <IconSegment
      name="hours"
      title={t("address.form.hours.title")}
      icon="calendar"
      body={
        isEditing ? (
          <RichTextEditor
            style={{ height: 200 }}
            name="notes"
            value={notes}
            onChange={data => setNotesData(data)}
            disabled={!canEdit}
          />
        ) : (
          <AddressHours {...{ annotation }} />
        )
      }
      footer={
        <>
          {canEdit && !isEditing && (
            <Button
              primary
              basic
              icon="edit"
              content={t("form.edit")}
              onClick={() => setEditing(true)}
            />
          )}
          {isEditing && <Button primary content={t("form.save")} onClick={triggerSave} />}
        </>
      }
    />
  );
};

export default AddressHoursSegment;
