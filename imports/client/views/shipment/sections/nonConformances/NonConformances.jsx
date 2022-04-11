import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { ReactTable } from "/imports/client/components/tables";
import { Button, Icon } from "semantic-ui-react";

import { DateTag, UserTag } from "/imports/client/components/tags";
import NonConformanceModal from "./modals/NonConformance.jsx";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { ADD_NON_CONFORMACE, UPDATE_NON_CONFORMACE, DELETE_NON_CONFORMACE } from "./utils/queries";

const debug = require("debug")("shipment:nonConformance");

const Overview = ({ isLoading, data, handleClicked, handleDelete }) => {
  return (
    <ReactTable
      isLoading={isLoading}
      emptyTableMsg={<Trans i18nKey="shipment.nonConformances.info" />}
      columns={[
        {
          Header: () => <Trans i18nKey="shipment.nonConformances.table.reasonCode" />,
          accessor: "reasonCode", // {}
          Cell: ({ value: reasonCode }) =>
            reasonCode
              ? `${reasonCode.event}-${reasonCode.owner}-RO-N-${reasonCode.occurance}-${reasonCode.reason}`
              : " - "
        },
        {
          Header: () => <Trans i18nKey="shipment.nonConformances.table.eventType" />,
          accessor: "reasonCode.event", // {}
          Cell: ({ value: event }) =>
            event ? <Trans i18nKey={`nonConformance.reasonCode.event.${event}`} /> : null
        },
        {
          Header: () => <Trans i18nKey="shipment.nonConformances.table.createdOn" />,
          accessor: "date",
          Cell: ({ value }) => <DateTag date={value} />
        },
        {
          Header: () => <Trans i18nKey="shipment.nonConformances.table.createdBy" />,
          accessor: "created.by",
          Cell: ({ value }) => <UserTag userId={value} />
        },
        {
          Header: () => null,
          id: "actions",
          Cell: ({ row: { original } }) => (
            <Icon
              name="delete"
              style={{ cursor: "pointer" }}
              onClick={e => {
                e.stopPropagation();
                handleDelete(original);
              }}
            />
          )
        }
      ]}
      data={data}
      onRowClicked={handleClicked}
    />
  );
};

export const NonConformancesSection = ({ shipmentId, shipment, security }) => {
  const client = useApolloClient();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });

  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const canEdit = security.canEditNonConformances;
  const nonConformances = shipment?.nonConformances || [];
  const hasNonconformances = nonConformances.length > 0;

  const onSaveForm = ({ id, ...data }) => {
    debug("saving non-conformance id: %s, %o", id, data);
    if (id) {
      client
        .mutate({ mutation: UPDATE_NON_CONFORMACE, variables: { id, update: data } })
        .then(({ errors }) => {
          if (errors) throw errors;
          showModal(false);
          toast.success("Non conformance updated");
        })
        .cath(error => {
          toast.error(error);
          console.error(error);
        });
    } else {
      client
        .mutate({ mutation: ADD_NON_CONFORMACE, variables: { shipmentId, data } })
        .then(({ errors }) => {
          if (errors) throw errors;
          showModal(false);
          toast.success("Non conformance created");
        })
        .cath(error => {
          toast.error(error);
          console.error(error);
        });
    }
  };

  const handleClicked = data => {
    setModalState({ ...modalState, nonConformance: data, show: true });
  };

  const handleDelete = data => {
    setConfirmState({ id: data.id, show: true });
  };

  const deleteNC = () => {
    const { id } = confirmState;
    client
      .mutate({ mutation: DELETE_NON_CONFORMACE, variables: { id } })
      .then(({ errors }) => {
        if (errors) throw errors;
        setConfirmState({ show: false });
        toast.success("Non conformance deleted");
      })
      .cath(error => {
        toast.error(error);
        console.error(error);
      });
  };

  return (
    <IconSegment
      title={<Trans i18nKey="shipment.nonConformances.title" />}
      icon="alarm"
      body={
        <>
          {hasNonconformances ? (
            <Overview
              {...{
                data: nonConformances,
                onSave: onSaveForm,
                canEdit,
                handleClicked,
                handleDelete
              }}
            />
          ) : (
            <Trans i18nKey="shipment.nonConformances.info" />
          )}

          <NonConformanceModal {...modalState} showModal={showModal} onSaveForm={onSaveForm} />
          <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={deleteNC} />
        </>
      }
      footer={
        canEdit ? (
          <Button primary content={<Trans i18nKey="form.add" />} onClick={() => showModal(true)} />
        ) : null
      }
    />
  );
};

export default NonConformancesSection;
