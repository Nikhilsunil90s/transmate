import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Segment, Button, Header } from "semantic-ui-react";
import { RichTextEditor } from "/imports/client/components/forms/uniforms/RichTextEditor";
import { initSlateValue } from "/imports/client/components/forms/uniforms/RichText.utils";

const PriceListNotesSection = ({ ...props }) => {
  const { security = {}, priceList = {}, onSave } = props;
  const canEdit = security.canAddMasterNotes;

  const [notes, setNotesData] = useState(initSlateValue(priceList.notes));

  const saveNotes = () => {
    onSave({ notes: JSON.stringify(notes) });
  };

  return (
    <Segment padded="very" className="notes">
      <Header as="h2" content={<Trans i18nKey="price.list.notes" />} />
      {canEdit ? (
        <>
          <RichTextEditor name="notes" value={notes} onChange={data => setNotesData(data)} />
          <Button primary content={<Trans i18nKey="form.save" />} onClick={saveNotes} />
        </>
      ) : (
        <div>{priceList.notes}</div>
      )}
    </Segment>
  );
};

export default PriceListNotesSection;
