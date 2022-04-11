import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { Checkbox, Form, Message } from "semantic-ui-react";
import TenderifyMappingTableComponent from "./MappingTableComponent";
import TenderifyMappingModal from "./modals/MappingModal";
import { EDIT_TENDER_BID_MAPPING } from "/imports/client/views/tenderify/utils/queries";

const debug = require("debug")("tenderBid:mapping");

const TenderifyMappingTableEmpty = () => (
  <Message
    info
    icon="exclamation"
    header={<Trans i18nKey="tenderify.mapping.values.emptyTitle" />}
    content={
      <p>
        <Trans i18nKey="tenderify.mapping.values.empty" />
      </p>
    }
  />
);

/**
 * for a given mapping topic, the colHeaders and data is passed in.
 */
const TenderifyMappingTable = ({ valueMap, topic, mappingId, security }) => {
  const [modalState, setModalState] = useState({
    show: false,
    onSave: () => {},
    onCancel: () => {}
  });
  const showModal = show => setModalState({ ...modalState, show });
  const [updateMapping] = useMutation(EDIT_TENDER_BID_MAPPING, {
    onCompleted() {
      toast.success("Mapping stored");
      showModal(false);
    },
    onError(error) {
      console.error(error);
      toast.error("Could not save mapping");
    }
  });
  const [filters, setFilters] = useState({ valid: true, invalid: true });
  const { data, colHeaders } = valueMap || {};

  const handleMappingChange = (updates, cb) => {
    let changeCount = 0;
    const mappings = {};
    let hasMappingsToShow = false;
    const updateM = [];

    // 1. check updates:
    updates.forEach(({ colDef, data, newValue }) => {
      const colKey = colDef.field;

      const propKey = colKey.split("_").slice(-1)[0];
      const orgValue = data[`origin_${propKey}`];
      changeCount += 1;
      if (orgValue !== null) {
        const setValue = { o: orgValue, t: newValue, store: true };
        mappings[propKey] = [].concat(mappings[propKey] || [], setValue);
      }

      // store changes itself:
      updateM.push({
        originId: data.originId,
        colKey,
        value: newValue
      });
    });

    // 2. make mappings unique:
    Object.entries(mappings).forEach(([k, mapArray]) => {
      const uniqueMaps = mapArray.filter((item, index) => {
        const curItem = JSON.stringify(item);
        return (
          index ===
          mapArray.findIndex(obj => {
            return JSON.stringify(obj) === curItem;
          })
        );
      });
      mappings[k] = uniqueMaps;
      if (uniqueMaps.length > 0 && !hasMappingsToShow) {
        hasMappingsToShow = true;
      }
    });

    debug(
      "saving changes %o, changeCount: %s, hasMappingsToShow: %s",
      updateM,
      changeCount,
      hasMappingsToShow // especially when there is no left original value...
    );
    // show modal OR save direct
    if (changeCount > 0) {
      // show modal to the user
      // keep mapping?
      // if yes -> store mapping & apply
      // if no -> revert value back to the preceding value

      if (hasMappingsToShow) {
        // render modal if there are valid mappings to store:
        setModalState({
          show: true,
          mappings,
          onSave: ({ valueMaps }) => {
            debug("saving mapping %o", valueMaps);
            updateMapping({
              variables: {
                input: {
                  mappingId,
                  mappingV: {
                    key: topic,
                    updates: updateM
                  },
                  mappingF: valueMaps
                }
              }
            });
          },

          closable: false
        });
      } else {
        // save without mappingF:
        updateMapping({
          variables: {
            input: {
              mappingId,
              mappingV: {
                key: topic,
                updates: updateM
              }
            }
          }
        });
      }
    }
  };
  return valueMap ? (
    <>
      <Form>
        <Form.Field inline>
          <Checkbox
            checked={filters.valid}
            label="Valid"
            onChange={() => setFilters({ ...filters, valid: !filters.valid })}
          />
          <Checkbox
            checked={filters.invalid}
            label="Invalid"
            onChange={() => setFilters({ ...filters, invalid: !filters.invalid })}
          />
        </Form.Field>
      </Form>
      <div id="gridHolder" style={{ height: "100%" }}>
        <TenderifyMappingTableComponent
          data={data}
          colHeaders={colHeaders}
          topic={topic}
          mappingId={mappingId}
          filters={filters}
          afterChange={handleMappingChange}
          security={security}
        />
      </div>
      <TenderifyMappingModal {...modalState} showModal={showModal} />
    </>
  ) : (
    <TenderifyMappingTableEmpty />
  );
};

TenderifyMappingTable.propTypes = {
  mappingId: PropTypes.string.isRequired,
  topic: PropTypes.string.isRequired,
  valueMap: PropTypes.object
};

export default TenderifyMappingTable;
