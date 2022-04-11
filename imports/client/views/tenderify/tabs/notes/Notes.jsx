import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Button } from "semantic-ui-react";
import { RichTextEditor, initSlateValue } from "/imports/client/components/forms/uniforms";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const TenderifyNotesTab = ({ ...props }) => {
  const { tenderBid, security, onSave } = props;
  const [notes, setNotesData] = useState(initSlateValue(tenderBid.notes));
  const saveNotes = () => onSave({ notes: JSON.stringify(notes) });

  const canEdit = security.editGeneral;
  return (
    <IconSegment
      name="notes"
      icon="paste"
      title="Notes"
      body={
        notes ? (
          <RichTextEditor
            style={{ height: 200 }}
            name="notes"
            value={notes}
            onChange={value => setNotesData(value)}
            disabled={!canEdit}
          />
        ) : (
          <p>No notes added</p>
        )
      }
      footer={
        <Button
          primary
          content={<Trans i18nKey="form.save" />}
          onClick={saveNotes}
          disabled={!canEdit}
        />
      }
    />
  );
};

export default TenderifyNotesTab;
