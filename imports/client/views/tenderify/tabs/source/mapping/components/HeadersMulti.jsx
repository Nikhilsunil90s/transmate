import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useApolloClient, useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Dropdown, Form, Table, Button } from "semantic-ui-react";
import SettingsContext from "../../../../utils/settingsContext";
import TenderifyMappingHeadersMultiRow from "./HeadersMultiRow";
import { ConfirmComponent } from "/imports/client/components/modals";
import { mappingHType } from "../utils/propTypes";
import { EDIT_TENDER_BID_MAPPING } from "../../../../utils/queries";

const debug = require("debug")("tenderify:mapping:headersmulti");

const DEFAULT_PARENT = "charges";

// flow:
// 1. user selects parent -> are you sure? -> y -> save
// 2. the fields for that specific parent are available with the sub fields

const TenderifyMappingHeadersMulti = props => {
  const client = useApolloClient();
  const { multiMap, mappingId, mappingKey } = props;

  const { mappingParents, mappingKeys } = useContext(SettingsContext);
  const [confirmParentState, setConfirmParentState] = useState({ show: false });
  const showConfirm = show => setConfirmParentState({ ...confirmParentState, show });
  const [selectedParent, setSelectedParent] = useState(multiMap.parent || DEFAULT_PARENT);
  const [hasItemsToSave, setHasItemsToSave] = useState(false);
  const [mappingRows, setMappingRows] = useState(multiMap.linkedMapping || []);
  const [updateMapping, { loading }] = useMutation(EDIT_TENDER_BID_MAPPING, {
    onError(error) {
      console.error(error);
      toast.error("Could not save mapping");
    },
    onCompleted() {
      toast.success("Mapping saved");
    }
  });

  const parentOptions = (mappingParents || []).map(p => ({ value: p, text: p }));
  const parentFieldOptions = mappingKeys
    .filter(({ parent }) => parent === selectedParent)
    .map(h => ({ value: h.k, text: h.label }));

  const onChangeParent = (e, { value }) => {
    setConfirmParentState({
      show: true,
      newParent: value,
      confirmMessage: (
        <Trans
          i18nKey="tenderify.mapping.header.parentChange"
          values={{ currentParent: selectedParent, newParent: value }}
        />
      )
    });
  };
  const afterConfirmChangeParent = () => {
    const { newParent } = confirmParentState;

    // update db = erasing all linkedMappings that exist:
    const { linkedMapping, ...curMapping } = multiMap || {};
    const update = { [mappingKey]: { ...curMapping, parent: newParent } };

    debug("update mapping: %o", update);
    updateMapping({
      variables: {
        input: {
          mappingId,
          mappingH: update
        }
      }
    })
      .then(() => {
        setSelectedParent(newParent);
        setConfirmParentState({ show: false });
      })
      .catch(e => toast.error("Could not change parent"));
  };

  const onChangeMultiRow = (update, index) => {
    const updatedLinkedMapping = mappingRows.map((el, idx) => {
      if (idx === index) {
        return update;
      }
      return el;
    });

    setMappingRows(updatedLinkedMapping);
    setHasItemsToSave(true);
  };

  const saveChangesToDb = () => {
    const { linkedMapping, ...curMapping } = multiMap || {};
    updateMapping({
      variables: {
        input: {
          mappingId,
          mappingH: { [mappingKey]: { ...curMapping, linkedMapping: mappingRows } }
        }
      },
      onCompleted() {
        setHasItemsToSave(false);
        toast.success("Mapping saved");
      }
    });
  };

  const onRemoveRow = index => {
    const { linkedMapping, ...curMapping } = multiMap || {};
    const updatedLinkedMapping = (linkedMapping || []).filter((el, idx) => idx !== index);
    setMappingRows(updatedLinkedMapping);
    updateMapping({
      variables: {
        input: {
          mappingId,
          mappingH: { [mappingKey]: { ...curMapping, linkedMapping: updatedLinkedMapping } }
        }
      }
    });
  };
  return (
    // is already part of a form -> no more form tag needed
    <>
      {/* parent */}
      <Form.Field inline>
        <label>
          <Trans i18nKey={"tenderify.mapping.header.parentType"} />
        </label>
        <Dropdown
          name="parent"
          selection
          value={selectedParent}
          options={parentOptions}
          onChange={onChangeParent}
        />
      </Form.Field>
      <ConfirmComponent
        show={confirmParentState.show}
        showConfirm={showConfirm}
        onConfirm={afterConfirmChangeParent}
        content={confirmParentState.confirmMessage}
      />

      {mappingRows.length ? (
        <Table color="purple" compact>
          <Table.Body>
            {mappingRows.map((mapRow, index) => (
              <TenderifyMappingHeadersMultiRow
                key={`mappingHeadersMultiRow-${index}`}
                mappingId={mappingId}
                mapRow={mapRow}
                parentFieldOptions={parentFieldOptions}
                mappingKey={mappingKey}
                index={index}
                onChange={onChangeMultiRow}
                onRemoveRow={onRemoveRow}
              />
            ))}
          </Table.Body>
        </Table>
      ) : (
        <p>
          <Trans i18nKey="tenderify.mapping.header.noSubFields" />
        </p>
      )}
      <Button
        key="addMultiMapping"
        content={<Trans i18nKey="tenderify.mapping.header.addBtn" />}
        onClick={() => setMappingRows([...mappingRows, {}])}
      />

      {hasItemsToSave && (
        <Button
          key="saveMultiMapping"
          primary
          loading={loading}
          content={<Trans i18nKey="form.save" />}
          onClick={saveChangesToDb}
        />
      )}
    </>
  );
};

TenderifyMappingHeadersMulti.propTypes = {
  mappingId: PropTypes.string.isRequired,
  mappingKey: PropTypes.string.isRequired,
  multiMap: PropTypes.shape(mappingHType)
};

export default TenderifyMappingHeadersMulti;
