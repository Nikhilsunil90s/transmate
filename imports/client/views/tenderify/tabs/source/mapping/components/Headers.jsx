import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Checkbox, Dropdown, Form, Table } from "semantic-ui-react";
import { HeaderMappingTable } from "./headersMapClass";
import TenderifyMappingHeadersMulti from "./HeadersMulti";
import { EDIT_TENDER_BID_MAPPING } from "../../../../utils/queries";
import SettingsContext from "../../../../utils/settingsContext";

const debug = require("debug")("tenderify:mapping:headers");

const AddTenderMapRow = ({ mappingId, mappingH, unmappedOptions }) => {
  const { headerMappingOptions } = useContext(SettingsContext);

  const [formState, setState] = useState({
    originK: unmappedOptions[0]?.value,
    targetK: null,
    targetKError: null
  });
  const [editMapping, { loading: mLoading }] = useMutation(EDIT_TENDER_BID_MAPPING);
  async function addHeaderMap() {
    if (!formState.targetK)
      return setState({ ...formState, targetKError: "Must have target field selected" });
    const leftKey = formState.originK;
    const update = { [leftKey]: { ...mappingH[leftKey], target: formState.targetK } };

    debug("adding mapping for %o", update);
    try {
      const { error } = await editMapping({
        variables: {
          input: {
            mappingId,
            mappingH: update
          }
        }
      });

      if (error) throw error;
      setState({ originK: null, targetK: null, targetKError: null });
    } catch (error) {
      console.error(error);
      toast.error("Could not save new mapping");
    }
  }

  return (
    <Table.Row>
      <Table.Cell
        content={
          <Form.Field>
            <Dropdown
              search
              selection
              options={unmappedOptions || []}
              value={formState.originK || ""}
              onChange={(e, { value }) => setState({ ...formState, originK: value })}
            />
          </Form.Field>
        }
      />
      <Table.Cell
        content={
          <Form.Field error={formState.targetKError}>
            <Dropdown
              search
              selection
              options={headerMappingOptions}
              value={formState.targetK || ""}
              onChange={(e, { value }) => setState({ ...formState, targetK: value })}
            />
          </Form.Field>
        }
      />
      <Table.Cell
        content={
          <Button
            icon="plus"
            loading={mLoading}
            content={<Trans i18nKey="tenderify.mapping.header.add" />}
            onClick={addHeaderMap}
          />
        }
      />
    </Table.Row>
  );
};

const EditTenderMapRow = ({ mappingId, mappingH, headerMap }) => {
  let timeoutId;
  const { headerMappingOptions } = useContext(SettingsContext);
  const { headerMapKey, target, fill } = headerMap;
  const [saveState, setSaveState] = useState(false);
  const [formState, setState] = useState({ target, fill });
  const [editMapping, { loading: mLoading }] = useMutation(EDIT_TENDER_BID_MAPPING, {
    onCompleted(data) {
      debug("result EditTenderMapRowsaving changes  %o", data);
      toast.success("Changes stored");
    },
    onError() {
      toast.error("Could not save changes");
    }
  });

  async function saveToDb(updatedState) {
    if (!headerMapKey) return;
    const update = { [headerMapKey]: { ...mappingH[headerMapKey], ...updatedState } };

    debug("saving changes %o", update);
    editMapping({
      variables: {
        input: {
          mappingId,
          mappingH: update
        }
      }
    });
  }

  async function autoSave(update) {
    setSaveState(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(async () => {
      await saveToDb(update);
      setSaveState(true);
    }, 3000);
  }

  const updateField = update => {
    const newState = { ...formState, ...update }; // update: {target, fill}
    setState(newState);
    autoSave(newState);
  };
  return (
    <React.Fragment>
      <Table.Row>
        <Table.Cell
          content={
            <>
              {headerMap.origin} - <span style={{ opacity: 0.5 }}>{headerMap.cell}</span>
            </>
          }
        />
        {/* Target */}
        <Table.Cell
          content={
            <Dropdown
              selection
              fluid
              search
              options={headerMappingOptions}
              value={formState.target}
              disabled={mLoading}
              onChange={(e, { value }) => updateField({ target: value })}
            />
          }
        />
        <Table.Cell
          content={
            <Checkbox
              checked={formState.fill}
              onChange={() => updateField({ fill: !formState.fill })}
            />
          }
        />
      </Table.Row>
      {formState.target === "multi" && (
        <Table.Row>
          <Table.Cell colSpan="3" className="noTopPadding">
            <TenderifyMappingHeadersMulti
              mappingId={mappingId}
              multiMap={headerMap}
              mappingKey={headerMapKey}
            />
          </Table.Cell>
        </Table.Row>
      )}
    </React.Fragment>
  );
};

const TenderifyMappingHeaders = ({ ...props }) => {
  const { mappingH, canEdit } = props;

  const { mappedHeaders, unmappedOptions } = new HeaderMappingTable({ mappingH });

  return (
    <Form>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell content={<Trans i18nKey="tenderify.mapping.header.original" />} />
            <Table.Cell content={<Trans i18nKey="tenderify.mapping.header.target" />} />
            <Table.Cell content={<Trans i18nKey="tenderify.mapping.header.fill" />} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mappedHeaders.map((headerMap, i) => (
            <EditTenderMapRow key={`tenderMapRow-${i}`} {...props} headerMap={headerMap} />
          ))}

          {canEdit && <AddTenderMapRow {...props} unmappedOptions={unmappedOptions} />}
        </Table.Body>
      </Table>
    </Form>
  );
};

export default TenderifyMappingHeaders;
