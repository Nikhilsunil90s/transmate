import { toast } from "react-toastify";
import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { ReactTable } from "/imports/client/components/tables";
import { Trans } from "react-i18next";
import { AccountEntitySchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/account-entity";
import EntityModal from "./modals/EntityModal";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { UPDATE_ACCOUNT } from "../../../utils/queries";

// eslint-disable-next-line no-underscore-dangle
const columns = AccountEntitySchema._schemaKeys.map(key => ({
  Header: <Trans i18nKey={`settings.entities.${key}`} />,
  accessor: key
}));

let showModal = () => {};
const AccountEntities = ({ account = {}, key, icon, title, security }) => {
  const client = useApolloClient();
  const accountEntities = account.entities || [];
  const [modalState, setModalState] = useState({ show: false });
  showModal = show => setModalState({ ...modalState, show });

  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const canEdit = security.canEditEntities;
  const handleClicked = data =>
    setModalState({ ...modalState, show: true, data, locked: !canEdit });

  function removeEntity() {
    const { code } = confirmState;
    if (!code) return;

    const updatedEntities = accountEntities.filter(({ code: itemCode }) => itemCode !== code);
    client
      .mutate({
        mutation: UPDATE_ACCOUNT,
        variables: { updates: { entities: updatedEntities } }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Changes saved");
        setConfirmState({ show: false });
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save your changes");
      });
  }

  const onSubmitForm = ({ code, ...data }) => {
    const entities = [...accountEntities.filter(ent => ent.code !== code), { code, ...data }];

    client
      .mutate({
        mutation: UPDATE_ACCOUNT,
        variables: { updates: { entities } }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Changes saved");
        showModal(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save your changes");
      });
  };

  const existingCodes = accountEntities.map(({ code }) => code);

  return (
    <>
      <IconSegment
        name={key}
        icon={icon}
        title={title}
        body={
          <ReactTable
            paginate
            tableClass="ui single line selectable table"
            shouldShowTablePagination
            columns={[
              ...columns,
              {
                id: "actions",
                className: "collapsing",
                Cell: ({ row: { original } }) => (
                  <Button.Group>
                    <Button icon="eye" onClick={() => handleClicked(original)} />
                    {canEdit && (
                      <Button
                        icon="trash alternate"
                        onClick={() => setConfirmState({ show: true, code: original.code })}
                      />
                    )}
                  </Button.Group>
                )
              }
            ]}
            data={accountEntities}
            onRowClicked={handleClicked}
          />
        }
        footer={
          canEdit ? (
            <Button
              primary
              basic
              icon="edit"
              content={<Trans i18nKey="form.add" />}
              onClick={() => showModal(true)}
            />
          ) : (
            undefined
          )
        }
      />
      <EntityModal {...modalState} {...{ showModal, onSubmitForm }} existingCodes={existingCodes} />
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={removeEntity} />
    </>
  );
};

export default AccountEntities;
