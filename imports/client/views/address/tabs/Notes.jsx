import React, { useState } from "react";
import get from "lodash.get";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import CodingSegment from "/imports/client/views/account/profile/components/CodingForm.jsx";
import { RichTextEditor, initSlateValue } from "/imports/client/components/forms/uniforms";

const debug = require("debug")("address:UI");

const NotesSegment = ({ ...props }) => {
  const { t } = useTranslation();
  const { security = {}, address = {}, onSave } = props;
  const { canEdit } = security;
  const notesData = get(address, ["annotation", "notes"], "");
  const [notes, setNotesData] = useState(initSlateValue(notesData));
  const saveNotes = () => onSave({ notes: JSON.stringify(notes) });
  return (
    <IconSegment
      name="notes"
      icon="sticky note outline"
      title="Notes"
      body={
        <RichTextEditor
          style={{ height: 200 }}
          name="notes"
          value={notes}
          onChange={data => setNotesData(data)}
          disabled={!canEdit}
        />
      }
      footer={<Button primary content={t("form.save")} onClick={saveNotes} disabled={!canEdit} />}
    />
  );
};

const AddressNotesTab = ({ ...props }) => {
  const { address, security, onSave } = props;
  const codingData = get(address, ["annotation", "coding"]) || {};

  const onSaveCoding = coding => {
    debug("saving coding form %o", coding);
    onSave({ coding });
  };

  return (
    <>
      <CodingSegment {...{ data: codingData, canEdit: security.canEdit, onSave: onSaveCoding }} />
      <NotesSegment {...props} {...{ onSave }} />
    </>
  );
};

export default AddressNotesTab;
