import React, { useState } from "react";
import { Trans } from "react-i18next";
import { List, Icon, Header } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import ReferenceModal from "./modals/Reference.jsx";
import initializeConfirm from "/imports/client/components/modals/confirm";
import { tabProptypes } from "../../utils/propTypes";
import { UPDATE_REFERENCES } from "./utils/queries";

const debug = require("debug")("shipment:references");

//#region components
const ReferencesOverview = ({ references = [], canEdit, onDelete }) => {
  return (
    <List>
      {references.map(({ key, header, description, onClick }) => (
        <List.Item key={key} as="a" onClick={onClick}>
          {canEdit && (
            <List.Content floated="right">
              <Icon
                name="close"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(key);
                }}
              />
            </List.Content>
          )}
          <List.Content>
            <List.Header content={header} />
            <List.Description content={description} />
          </List.Content>
        </List.Item>
      ))}
    </List>
  );
};

const TrackingReferencesOverview = ({ trackingReferences }) => {
  return (
    <>
      <Header as="h6">
        <Trans i18nKey="shipment.references.trackingNumbers" />
      </Header>
      {trackingReferences.map((trackingNumber, i) => (
        <span key={`trackingNumber-${i}`}>{trackingNumber}</span>
      ))}
    </>
  );
};
//#endregion

const ShipmentReferencesSection = ({ shipmentId, shipment = {}, security }) => {
  const client = useApolloClient();
  const [modalState, setState] = useState({ show: false });
  const [keyToRemove, setKeyToRemove] = useState();
  const { showConfirm, Confirm } = initializeConfirm();

  const canEdit = security.canEditReferences;
  function showModal(show) {
    setState({ ...modalState, show });
  }
  function saveReferences({ references }, cb) {
    client
      .mutate({
        mutation: UPDATE_REFERENCES,
        variables: {
          shipmentId,
          updates: { references }
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("References saved");
        if (cb) cb();
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not save references");
      });
  }
  function onSaveForm({ type, ref }) {
    saveReferences(
      {
        references: {
          ...shipment.references,
          [`${type}`]: ref
        }
      },
      () => showModal(false)
    );
  }

  function handleDelete(key) {
    showConfirm(true);
    setKeyToRemove(key);
  }

  function onDeleteReference() {
    debug("delete ref", keyToRemove);
    const newRefs = (({ [keyToRemove]: a, ...otherKeys }) => otherKeys)(shipment.references || {});
    saveReferences({ references: newRefs });
    showConfirm(false);
  }

  const references = Object.entries(shipment.references || {}).map(([key, value]) => ({
    key,
    header: <Trans i18nKey={`shipment.references.${key}`} />,
    description: value,
    onClick: () => setState({ ...modalState, show: true, reference: { type: key, ref: value } })
  }));
  const trackingReferences = shipment.trackingNumbers || [];
  const hasRefs = references.length + trackingReferences.length > 0;

  return (
    <IconSegment
      name="references"
      icon="remove bookmark"
      title={<Trans i18nKey="shipment.references.title" />}
      headerButton={canEdit}
      onHeaderButtonClick={() => setState({ show: true })}
      body={
        <>
          {hasRefs ? (
            <>
              <ReferencesOverview
                references={references}
                onDelete={handleDelete}
                canEdit={canEdit}
              />
              <Confirm onConfirm={onDeleteReference} />
            </>
          ) : (
            <div className="empty">
              <Trans i18nKey="shipment.references.info" />
            </div>
          )}
          {Boolean(trackingReferences.length) && (
            <TrackingReferencesOverview trackingReferences={trackingReferences} />
          )}
          <ReferenceModal {...modalState} {...{ showModal, onSaveForm }} />
        </>
      }
    />
  );
};

ShipmentReferencesSection.propTypes = tabProptypes;

export default ShipmentReferencesSection;
