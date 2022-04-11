/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Button, Container } from "semantic-ui-react";

import { useApolloClient } from "@apollo/client";

import { IconSegment } from "../../../components/utilities/IconSegment";
import { RichTextEditor } from "/imports/client/components/forms/uniforms/RichTextEditor";
import { tabPropTypes } from "../utils/propTypes";
import { mutate } from "/imports/utils/UI/mutate";
import { EDIT_SHIPMENT_PROJECT_NOTES } from "../utils/queries";

const initSlateValue = str => {
  let parsed;
  if (typeof str === "string") {
    try {
      parsed = JSON.parse(str);
    } catch (e) {
      console.error({ e });
    }
  }
  return parsed;
};

const ProjectNotes = ({ projectId, project = {}, canEdit }) => {
  const client = useApolloClient();
  const [isLoading, setLoading] = useState(false);
  const [notes, setNotesData] = useState(initSlateValue(project.notes));
  const [lessons, setLessonsData] = useState(initSlateValue(project.lessons));

  function onSave(update) {
    setLoading(true);
    mutate(
      {
        client,
        query: {
          mutation: EDIT_SHIPMENT_PROJECT_NOTES,
          variables: { input: { projectId, update } }
        }
      },
      () => setLoading(false)
    );
  }

  const saveNotes = () => onSave({ notes: JSON.stringify(notes) });
  const saveLessons = () => onSave({ lessons: JSON.stringify(lessons) });

  return (
    <Container fluid>
      <IconSegment
        name="notes"
        icon="sticky note outline"
        title="Notes"
        body={
          <RichTextEditor
            name="notes"
            value={notes}
            onChange={data => setNotesData(data)}
            disabled={!canEdit || isLoading}
          />
        }
        footer={
          <Button
            primary
            content={<Trans i18nKey="form.save" />}
            onClick={saveNotes}
            disabled={!canEdit || isLoading}
          />
        }
      />
      <IconSegment
        name="lessonsLearned"
        icon="flask"
        title="Lessons learned"
        body={
          <RichTextEditor
            name="lessons"
            value={lessons}
            onChange={data => setLessonsData(data)}
            disabled={!canEdit || isLoading}
          />
        }
        footer={
          <Button
            primary
            content={<Trans i18nKey="form.save" />}
            onClick={saveLessons}
            disabled={!canEdit || isLoading}
          />
        }
      />
    </Container>
  );
};

ProjectNotes.propTypes = tabPropTypes;

export default ProjectNotes;
