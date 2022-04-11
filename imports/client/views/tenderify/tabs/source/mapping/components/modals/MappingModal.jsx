import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { Checkbox, Form, Message, Table } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";

const debug = require("debug")("tenderBid:mapping");

const MAPPING_STORE_OPTIONS = ["file", "account", "partnership", "ignore"];
const DEFAULT_STORE_OPTION = "ignore";

const TenderifyMappingModal = ({ ...props }) => {
  const { t } = useTranslation();
  const { show, showModal, mappings = {}, onSave } = props;
  const [storeOption, setStoreOption] = useState(DEFAULT_STORE_OPTION);
  const [mappingStoreState, setMappingStoreState] = useState([]);
  useEffect(() => {
    if (show) setMappingStoreState(mappings);
  }, [show]);

  const updateStoreState = (k, idx) => {
    debug("test: %s, %s", k, idx);
    const mod = { ...mappingStoreState };
    mod[k] = mappingStoreState[k].map((el, i) => {
      if (i === idx) {
        return { ...el, store: !el.store };
      }
      return el;
    });
    setMappingStoreState(mod);
  };

  const onConfirmSave = () => {
    const mod = {};
    Object.entries(mappingStoreState).forEach(([k, mapArray]) => {
      mod[k] = mapArray.filter(obj => obj.store).map(obj => ({ ...obj, store: storeOption }));
    });
    onSave({ valueMaps: mod });
  };

  // TODO -> store this differently!! we get mappings as: [key]: {o,t}
  // when we store it, we just get the flag as type as an extra key -> se we need to keep track of store yes & no and then update the store option

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="tenderify.mapping.values.modal.title" />}
      body={
        <>
          <Message info content={<Trans i18nKey="tenderify.mapping.values.modal.message" />} />
          <Form>
            {Object.keys(mappingStoreState).map((key, i) => (
              <React.Fragment key={`mappedKey-${key}`}>
                <Form.Field>{key}</Form.Field>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        content={<Trans i18nKey="tenderify.mapping.values.modal.origin" />}
                      />
                      <Table.HeaderCell
                        content={<Trans i18nKey="tenderify.mapping.values.modal.target" />}
                      />
                      <Table.HeaderCell
                        content={<Trans i18nKey="tenderify.mapping.values.modal.store" />}
                      />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(mappingStoreState[key] || []).map((map, j) => (
                      <Table.Row key={`mappingRow-${key}-${j}`}>
                        <Table.Cell content={map.o} />
                        <Table.Cell content={map.t} />
                        <Table.Cell
                          content={
                            <Checkbox
                              checked={map.store}
                              onChange={() => updateStoreState(key, j)}
                            />
                          }
                        />
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </React.Fragment>
            ))}

            <Form.Field>
              <label>
                <Trans i18nKey="tenderify.mapping.values.modal.flag" />
              </label>
              {MAPPING_STORE_OPTIONS.map(item => (
                <Form.Field key={`flagOption-${item}`}>
                  <Checkbox
                    radio
                    name="storeOptions"
                    value={item}
                    label={t(`tenderify.mapping.values.modal.storeOptions.${item}`)}
                    checked={storeOption === item}
                    onChange={(e, { value }) => setStoreOption(value)}
                  />
                </Form.Field>
              ))}
            </Form.Field>
          </Form>
        </>
      }
      actions={<ModalActions {...{ showModal, onSave: onConfirmSave }} />}
    />
  );
};

TenderifyMappingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  mappings: PropTypes.object // <key > : {o:..., t: ...}
};

export default TenderifyMappingModal;
