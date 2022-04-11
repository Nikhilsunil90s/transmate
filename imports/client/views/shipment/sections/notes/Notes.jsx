/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import get from "lodash.get";
import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";

import { List, Icon } from "semantic-ui-react";
import { IconSegment } from "../../../../components/utilities/IconSegment";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes";
import NotesModal from "./modals/Note";
import initializeConfirm from "/imports/client/components/modals/confirm";
import { mutate } from "/imports/utils/UI/mutate";
import { UPDATE_NOTES } from "./utils/queries";

const debug = require("debug")("shipment:notes");

function getCostParamsNotes(shipment, t) {
  // if specific cost params are given by customer through edi
  const costParamsList = [];
  const costParams = get(shipment, "costParams") || {};
  if (costParams.customsClearance)
    costParamsList.push({
      label: t("shipment.costParams.customsClearance.label"),
      value:
        costParams.customsClearance === true ||
        costParams.customsClearance === "true" ||
        costParams.customsClearance === "yes"
          ? t("shipment.costParams.customsClearance.yes")
          : t("shipment.costParams.customsClearance.no")
    });
  if (costParams.freeDays?.condition)
    costParamsList.push({
      label: t("shipment.costParams.freeDaysCondition"),
      value: costParams.freeDays.condition
    });
  return costParamsList;
}

const NotesList = ({ notes, canEdit, onClick = () => {}, onDelete = () => {} }) => (
  <List>
    {notes.map((note, i) => (
      <List.Item key={i}>
        {canEdit && (
          <List.Content floated="right">
            <Icon name="delete" style={{ cursor: "pointer" }} onClick={() => onDelete(note.key)} />
          </List.Content>
        )}
        <List.Content>
          <List.Header as="a" onClick={() => onClick(note.key)}>
            {note.label}
          </List.Header>
          <List.Description>{note.value}</List.Description>
        </List.Content>
      </List.Item>
    ))}
  </List>
);

const ShipmentNotes = ({ shipment, shipmentId, security }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [modalState, setState] = useState({ show: false });
  const [keyToRemove, setKeyToRemove] = useState();
  const { showConfirm, Confirm } = initializeConfirm();
  const showModal = show => setState({ ...modalState, show });

  const { notes = {} } = shipment;
  const notesList = Object.entries(notes).map(([key, value]) => ({
    key,
    label: t(`shipment.notes.${key}`),
    value
  }));
  const costParamsList = getCostParamsNotes(shipment, t);

  async function onSaveNotes(updates, callback) {
    mutate(
      {
        client,
        query: {
          mutation: UPDATE_NOTES,
          variables: { shipmentId, updates }
        },
        errorMsg: "Could not save notes"
      },
      callback
    );
  }

  const canEdit = security.canEditNotes;
  function onSubmitForm({ type, text }) {
    onSaveNotes({ [`notes.${type}`]: text }, () => showModal(false));
  }

  function handleDelete(key) {
    showConfirm(true);
    setKeyToRemove(key);
  }

  function onDeleteNote() {
    debug("delete note", keyToRemove);
    const newNotes = (({ [keyToRemove]: a, ...otherKeys }) => otherKeys)(notes || {});
    onSaveNotes({ notes: newNotes }, () => showConfirm(false));
  }

  function onClick(key) {
    const note = { type: key, text: notes[key] };
    setState({ ...modalState, note, isLocked: !canEdit, show: true });
  }

  return (
    <IconSegment
      title={<Trans i18nKey="shipment.notes.title" />}
      name="notes"
      icon="edit"
      headerButton={canEdit}
      onHeaderButtonClick={() => setState({ show: true })}
      body={
        <>
          {/* regular notes */}
          {notesList.length > 0 ? (
            <NotesList {...{ notes: notesList, canEdit, onDelete: handleDelete, onClick }} />
          ) : (
            <div className="empty">
              <Trans i18nKey="shipment.notes.info" />
            </div>
          )}

          {/* costparam notes */}
          {costParamsList.length > 0 && (
            <>
              <h3>
                <Trans i18nKey="shipment.costParams.title" />
              </h3>
              <NotesList {...{ notes: costParamsList, canEdit: false }} />
            </>
          )}
          <NotesModal {...modalState} {...{ showModal, onSubmitForm }} />
          <Confirm onConfirm={onDeleteNote} />
        </>
      }
    />
  );
};

ShipmentNotes.propTypes = tabProptypes;

export default ShipmentNotes;
