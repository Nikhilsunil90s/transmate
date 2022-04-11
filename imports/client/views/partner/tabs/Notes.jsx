import React, { useState } from "react";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { Button } from "semantic-ui-react";
import CodingSegment from "/imports/client/views/account/profile/components/CodingForm.jsx";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { RichTextEditor, initSlateValue } from "/imports/client/components/forms/uniforms";
import { tabProptypes } from "../utils/propTypes";

const NotesSegment = ({ ...props }) => {
  const { canEdit, data = "", onSave } = props;
  const [notes, setNotesData] = useState(initSlateValue(data));
  const saveNotes = () => onSave(JSON.stringify(notes));
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
          onChange={value => setNotesData(value)}
          disabled={!canEdit}
        />
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

const PartnerNotesTab = ({ partner, onSave, security = {} }) => {
  const coding = get(partner, ["annotation", "coding"]) || {};
  const notes = get(partner, ["annotation", "notes", "text"]);
  const canEdit = security.canAnnotatePartner;

  function saveCoding(update) {
    onSave({ update, root: "coding" });
  }
  function saveNotes(slateText) {
    onSave({ update: { text: slateText, date: new Date() }, root: "notes" });
  }

  return (
    <>
      <CodingSegment {...{ data: coding, onSave: saveCoding, canEdit }} />
      <NotesSegment {...{ data: notes, onSave: saveNotes, canEdit }} />
    </>
  );
};

PartnerNotesTab.propTypes = {
  ...tabProptypes
};

export default PartnerNotesTab;
