import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Random } from "/imports/utils/functions/random.js";
import get from "lodash.get";
import { useTranslation, Trans } from "react-i18next";
import { Form, Tab, Accordion, Icon } from "semantic-ui-react";
import { connectField, useField } from "uniforms";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import {
  ModalComponent,
  ModalActions,
  ModalActionsDelete,
  ModalActionsClose
} from "/imports/client/components/modals";

import { LaneDefinitionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListLaneDefinition";
import {
  ListItemField,
  ListField,
  ListAddField,
  ListDelField
} from "/imports/client/components/forms/uniforms/ListField";
import DropdownCountryFlag from "/imports/client/components/forms/input/DropdownCountryFlag.jsx";
import AddressInput, {
  AddressInput as AddressInputUnlinked
} from "/imports/client/components/forms/input/Address.jsx";
import LocationTagLoader from "/imports/client/components/tags/LocationTagLoader.jsx";
import { SelectField as SelectFieldUnlinked } from "/imports/client/components/forms/uniforms/SelectField";
import { LANE_STOP_TYPES } from "/imports/api/_jsonSchemas/enums/scope";
import { toast } from "react-toastify";
import IncotermField from "../../uniforms/IncotermField";

const debug = require("debug")("scope:lane");

//#region components
const schema = new SimpleSchema2Bridge(LaneDefinitionSchema);

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (props.index > -1) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`price.list.lane.${l}`} />;
}

const LocationTag = connectField(({ value, type }) => {
  return <LocationTagLoader {...{ id: value, type }} />;
});

const StopTag = connectField(({ ...props }) => {
  debug("stop tag props", props);
  const { type: stopType, addressId, locationId } = props.value || {};
  const type = !!locationId ? "locode" : "address";
  const id = locationId || addressId;
  return (
    <>
      {stopType}
      {" - "}
      <LocationTagLoader {...{ id, type }} />
    </>
  );
});

const AddStopField = () => {
  const [state, setState] = useState({});
  const stopTypeOptions = LANE_STOP_TYPES.map(t => ({ key: t, text: t, value: t }));
  const [{ onChange, value: fieldValue = [] }] = useField("stops", {});

  const saveStop = () => {
    fieldValue.push({
      type: state.stopType,
      [state.type === "address" ? "addressId" : "locationId"]: state.id
    });
    onChange(fieldValue);
    setState({});
  };
  return (
    <Form.Group widths={3}>
      <SelectFieldUnlinked
        className="three wide"
        options={stopTypeOptions}
        label={null}
        value={state.stopType}
        onChange={nVal => setState({ ...state, stopType: nVal })}
      />
      <AddressInputUnlinked
        className="ten wide field"
        label={null}
        options={{ excludeGlobal: true }}
        noAdd
        onChange={({ id, type }) => setState({ ...state, id, type })}
      />
      <div className="three wide field">
        <Icon color="grey" name="plus" style={{ cursor: "pointer" }} onClick={saveStop} />
      </div>
    </Form.Group>
  );
};

const LaneModalStopTab = () => {
  return (
    <>
      <AddStopField />
      <ListField name="stops">
        <ListItemField name="$">
          <StopTag name="" />
        </ListItemField>
        <ListDelField name="$" />
        <br />
      </ListField>
    </>
  );
};

const AccordionLaneSummary = connectField(
  ({ value, t }) =>
    `${t("price.list.lane.address.header")} (${(value?.addressIds?.length || 0) +
      (value?.locationIds?.length || 0)})`
);

const AccordionZoneSummary = connectField(
  ({ value, t }) => `${t("price.list.lane.address.header")} (${value?.zones?.length || 0})`
);

const LaneModalTab = ({ dir, isLocked, formRef }) => {
  const { t } = useTranslation();

  // const formRef = useRef();
  function handleAddressInput({ id, type }) {
    const field = type === "address" ? `${dir}.addressIds` : `${dir}.locationIds`;
    const fielValue = get(formRef.current.getModel(), field) || [];
    fielValue.push(id);
    formRef.current.change(field, fielValue);
  }
  return (
    <Accordion
      styled
      fluid
      defaultActiveIndex={1}
      panels={[
        {
          key: "laneAddress",
          title: { content: <AccordionLaneSummary name={dir} t={t} /> },
          content: {
            content: (
              <>
                <AddressInput
                  name={`${dir}.addressIds`} // todo -> locations..
                  label={null}
                  options={{ excludeGlobal: true }}
                  noAdd
                  onChange={handleAddressInput}
                />
                {/* lists the selected items: */}
                <ListField name={`${dir}.addressIds`}>
                  <ListItemField name="$">
                    <div className="fields" style={{ margin: undefined }}>
                      <div className="ten wide field">
                        <LocationTag name="" type="address" />
                      </div>
                      <ListDelField name="" />
                    </div>
                  </ListItemField>
                </ListField>
                <ListField name={`${dir}.locationIds`}>
                  <ListItemField name="$">
                    <div className="fields" style={{ margin: undefined }}>
                      <div className="ten wide field">
                        <LocationTag name="" type="locode" />
                      </div>
                      <ListDelField name="" />
                    </div>
                  </ListItemField>
                </ListField>
              </>
            )
          }
        },
        {
          key: "laneZone",
          title: { content: <AccordionZoneSummary name={dir} t={t} /> },
          content: {
            content: (
              <>
                <div>
                  <div className="fields" style={{ marginBottom: "0px" }}>
                    <div className="four wide field required">
                      <label>{t("price.list.form.zone.country")}</label>
                    </div>
                    <div className="four wide field required">
                      <label>{t("price.list.form.zone.from")}</label>
                    </div>
                    <div className="four wide field">
                      <label>{t("price.list.form.zone.to")}</label>
                    </div>
                  </div>
                  <ListField name={`${dir}.zones`}>
                    <ListItemField name="$">
                      <div className="fields" style={{ margin: undefined }}>
                        <DropdownCountryFlag
                          name="CC"
                          className={`four wide scopeLane${dir}CCRange`}
                          label={null}
                        />
                        <AutoField
                          name="from"
                          className={`four wide scopeLane${dir}ZipFromRange`}
                          label={null}
                        />
                        <AutoField
                          name="to"
                          className={`four wide scopeLane${dir}ZipToRange`}
                          label={null}
                        />
                        <ListDelField name="" />
                      </div>
                    </ListItemField>
                  </ListField>
                </div>
                <br />
                {!isLocked && (
                  <ListAddField
                    name={`${dir}.zones.$`}
                    label={t("price.list.volume.range.add")}
                    data-test={`scopeLane${dir}AddRange`}
                  />
                )}
                <ErrorsField />
              </>
            )
          }
        }
      ]}
    />
  );
};

export const LaneForm = React.forwardRef(({ lane = {}, disabled, onSubmitForm }, formRef) => {
  const onValidate = async (model, error) => {
    if (!error) {
      return null;
    }

    toast.error(`Invalid Stops: ${error?.message}`);

    throw error;
  };
  const { t } = useTranslation();
  const laneModel = {
    id: Random.id(6),
    ...lane
  };
  return (
    <AutoForm
      disabled={disabled}
      onSubmit={onSubmitForm}
      model={laneModel}
      schema={schema}
      ref={formRef}
      onValidate={onValidate}
    >
      <Form.Group widths="equal">
        <AutoField name="name" label={t("price.list.lane.name")} />
        <IncotermField name="incoterm" label={t("price.list.lane.incoterms")} />
      </Form.Group>
      <Tab
        menu={{ secondary: true, pointing: true }}
        panes={[
          {
            menuItem: "From",
            render: () => (
              <Tab.Pane>
                <LaneModalTab formRef={formRef} lane={lane} dir="from" />
              </Tab.Pane>
            )
          },
          {
            menuItem: "To",
            render: () => (
              <Tab.Pane>
                <LaneModalTab formRef={formRef} lane={lane} dir="to" />
              </Tab.Pane>
            )
          },
          {
            menuItem: "Stops",
            render: () => (
              <Tab.Pane>
                <LaneModalStopTab lane={lane} />
              </Tab.Pane>
            )
          }
        ]}
      />
    </AutoForm>
  );
});

//#endregion

const LaneModal = ({ ...props }) => {
  const [isSaving, setSaving] = useState(false);
  const { show, isLocked, index, showModal, lane, lanes, onSave } = props;
  const title = generateTitle(props);

  const formRef = useRef();

  const onSubmitForm = data => {
    debug("updating lane %o", data);
    setSaving(true);
    let lanesMod = [...(lanes || [])];

    if (index > -1) {
      lanesMod = lanesMod.map((item, i) => (i === index ? data : item));
    } else {
      lanesMod = [...lanesMod, data];
    }

    debug("lanes update: %o", lanesMod);
    onSave({ lanes: lanesMod }, () => setSaving(false));
  };

  const onDelete = () => {
    const lanesMod = lanes.filter((item, i) => i !== index);

    onSave({ lanes: lanesMod });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<LaneForm ref={formRef} {...{ lane, disabled: isLocked || isSaving, onSubmitForm }} />}
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!lane && (
            <ModalActionsDelete
              {...{
                showModal,
                disabled: isSaving,
                onSave: () => {
                  formRef.current.submit();
                },
                onDelete: () => onDelete(index)
              }}
            />
          )}
          {!isLocked && !lane && (
            <ModalActions
              {...{ showModal, disabled: isSaving, onSave: () => formRef.current.submit() }}
            />
          )}
        </>
      }
    />
  );
};

LaneModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func,
  isLocked: PropTypes.bool,
  index: PropTypes.number,
  lane: PropTypes.object,
  lanes: PropTypes.arrayOf(PropTypes.object),
  onSave: PropTypes.func
};

export default LaneModal;
