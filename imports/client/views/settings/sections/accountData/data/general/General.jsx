import React, { useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { Segment, Message, Dropdown, Label, Button, Form, Divider } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { useApolloClient, useQuery } from "@apollo/client";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import { SHIPMENT_TAGS } from "/imports/api/_jsonSchemas/enums/shipment.js";
import { ReactTable } from "/imports/client/components/tables";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import CostsModal from "./modals/CostsModal";

import { GET_GENERAL_SETTINGS, REMOVE_SETTING_COST, UPSERT_SETTING_COST } from "./queries";

const debug = require("debug")("settings:data");

/** maintain tags, costCodes */

const tagsToDropDownOptions = tags => tags.map(value => ({ key: value, value, text: value }));

const TagsSettings = ({ tags, onSave }) => {
  const { t } = useTranslation();
  const [hasItemsToSave, setHasItemsToSave] = useState(false);
  const [dataInput, setDataInput] = useState(tags || []);
  const [options, setOptions] = useState(tagsToDropDownOptions(tags || []));

  const onchange = (e, { value = [] }) => {
    setDataInput(value);
    setHasItemsToSave(true);
  };

  const handleAddition = (e, { value }) => {
    setOptions([...options, { key: value, value, text: value }]);
  };

  return (
    <>
      <h6>
        <Trans i18nKey="settings.data.tags.default" />
      </h6>
      <div>
        {SHIPMENT_TAGS.map((tag, i) => (
          <Label tag key={i} content={tag} />
        ))}
      </div>

      <Segment>
        <Form>
          <Form.Field>
            <label>
              <Trans i18nKey="settings.data.tags.label" />
            </label>
            <Dropdown
              placeholder={t("settings.data.tags.add")}
              fluid
              multiple
              search
              selection
              allowAdditions
              options={options}
              value={dataInput}
              onChange={onchange}
              onAddItem={handleAddition}
            />
          </Form.Field>
        </Form>
      </Segment>

      <Button
        primary
        disabled={!hasItemsToSave}
        content={<Trans i18nKey="form.save" />}
        onClick={() => {
          onSave({ tags: dataInput });
          setHasItemsToSave(false);
        }}
      />
    </>
  );
};

// user can define cost categories
// ! base cost is always the default base cost
export const CostsSettings = ({ costs, refetch }) => {
  const client = useApolloClient();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });

  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  function removeCost() {
    debug("removing %o", confirmState.cost);
    const { id } = confirmState.cost || {};

    client
      .mutate({ mutation: REMOVE_SETTING_COST, variables: { id } })
      .then(({ errors }) => {
        if (errors) throw errors;
        showConfirm(false);
        refetch();
      })
      .catch(error => {
        console.error({ error });
        toast.error("Could not save changes");
      });
  }

  function onSaveModal({ id, cost, group }) {
    debug("save modal data %o", { id, cost, group });

    client
      .mutate({
        mutation: UPSERT_SETTING_COST,
        variables: { input: { id, cost, group } }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        showModal(false);
        refetch();
      })
      .catch(error => {
        console.error({ error });
        toast.error("Could not save changes");
      });
  }

  // costs;
  return (
    <>
      <ReactTable
        columns={[
          { accessor: "group", Header: <Trans i18nKey="settings.data.costs.group" /> },
          { accessor: "type", Header: <Trans i18nKey="settings.data.costs.type" /> },
          { accessor: "cost", Header: <Trans i18nKey="settings.data.costs.cost" /> },
          {
            id: "actions",
            accessor: "id",
            Header: "",
            Cell: ({ row: { original } }) => (
              <Button.Group>
                <Button
                  icon="pencil"
                  onClick={() => setModalState({ show: true, cost: original })}
                />
                <Button
                  icon="trash alternate outline"
                  onClick={() => setConfirmState({ show: true, cost: original })}
                />
              </Button.Group>
            )
          }
        ]}
        data={costs}
      />
      <br />
      <Button
        content={<Trans i18nKey="form.add" />}
        onClick={() => setModalState({ show: true })}
      />
      <CostsModal {...modalState} showModal={showModal} onSave={onSaveModal} />
      <ConfirmComponent
        {...confirmState}
        showConfirm={showConfirm}
        onConfirm={removeCost}
        content={
          <Trans
            i18nKey="settings.data.costs.confirmDelete"
            values={{ value: confirmState.cost?.cost || "" }}
          />
        }
      />
    </>
  );
};

const MasterData = ({ ...props }) => {
  const { onSave } = props;
  const { data = {}, loading, error, refetch } = useQuery(GET_GENERAL_SETTINGS);

  debug("master data %o", { data, error });
  const tags = data.accountSettings?.tags || [];
  const costs = data.accountSettings?.costs || [];

  return (
    <>
      {loading ? (
        <Loader loading />
      ) : (
        <>
          <h4>
            <Trans i18nKey="settings.data.masterData.title" />
          </h4>

          <h5>
            <Trans i18nKey="settings.data.tags.title" />
          </h5>
          <Message info content={<Trans i18nKey="settings.data.tags.info" />} />
          <TagsSettings {...{ tags, onSave }} />

          <Divider />

          <h5>
            <Trans i18nKey="settings.data.costs.title" />
          </h5>
          <Message info content={<Trans i18nKey="settings.data.costs.info" />} />

          <CostsSettings {...{ costs, onSave, refetch }} />
        </>
      )}
    </>
  );
};

MasterData.propTypes = {
  onSave: PropTypes.func.isRequired,
  security: PropTypes.object.isRequired
};

export default MasterData;
