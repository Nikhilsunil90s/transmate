import React, { useState } from "react";
import { Random } from "/imports/utils/functions/random.js";
import { Trans, useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import range from "lodash.range";
import { Form, Input, Segment, Button } from "semantic-ui-react";
import { NumField, AutoForm, AutoField, NestField, ErrorsField } from "uniforms-semantic";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import {
  ListItemField,
  ListField,
  ListAddField,
  ListDelField
} from "/imports/client/components/forms/uniforms/ListField";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import {
  ModalComponent,
  ModalActions,
  ModalActionsClose,
  ModalActionsDelete
} from "/imports/client/components/modals";

import { rangeFormatter } from "/imports/utils/priceList/fnPriceListHelpers.js";
import { VolumeDefinitionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListVolumeDefinition";

const debug = require("debug")("scope:volumes");

const schema = new SimpleSchema2Bridge(VolumeDefinitionSchema);
const DEFAULT_UOM = "kg";

let formRef;
export const VolumeGroupForm = ({ data = {}, onSubmitForm, formRef: formRefProp, disabled }) => {
  const { t } = useTranslation();
  const [showGenerateTool, setShowGenerateTool] = useState(false);
  const [formState, setFormState] = useState({ from: 0, to: 25000, step: 1000 });
  const modelData = {
    id: Random.id(6),
    ranges: [
      {
        id: Random.id(6),
        from: 0,
        to: 100,
        name: `${rangeFormatter(0, 100)} ${data.uom || DEFAULT_UOM}`
      }
    ],
    uom: DEFAULT_UOM,
    ...data
  };

  const generate = () => {
    const { from, to, step } = formState;
    const { uom } = formRef.getModel();

    debug("generating ranges for %o", { from, to, step, uom });

    const series = range(from, to, step);

    const ranges = series.map(rng => ({
      from: rng,
      to: rng + parseFloat(step),
      id: Random.id(6),
      name: `${rangeFormatter(rng, rng + parseFloat(step))} ${uom}`
    }));

    debug("generated ranges: %o", ranges);
    formRef.change("ranges", ranges);
  };

  return (
    <>
      <AutoForm
        schema={schema}
        ref={ref => {
          // eslint-disable-next-line no-param-reassign
          // eslint-disable-next-line no-unused-expressions
          formRefProp && formRefProp(ref);
          formRef = ref;
        }}
        disabled={disabled}
        model={modelData}
        validator={{ clean: true }}
        onSubmit={onSubmitForm}
        modelTransform={(mode, model) => {
          const { id: volGrpId, ranges = [] } = model;
          const mod = {
            ...model,
            id: volGrpId || Random.id(6),
            ranges: ranges.map(({ id, name, from, to, ...rng }) => ({
              ...rng,
              id: id || Random.id(6),
              from,
              to,
              name:
                name ||
                (from >= 0 && to >= 0 && model.uom && `${rangeFormatter(from, to)} ${model.uom}`) ||
                undefined
            }))
          };
          return mod;
        }}
      >
        <Form.Group widths="equal">
          <SelectField name="uom" label={t("price.list.volume.uom")} disabled={disabled} />
          <SelectField
            name="serviceLevel"
            label={t("price.list.volume.serviceLevel")}
            disabled={disabled}
          />
        </Form.Group>

        <div>
          <div className="fields" style={{ marginBottom: "0px" }}>
            <div className="four wide field required">
              <label>{t("price.list.volume.range.from")}</label>
            </div>
            <div className="four wide field required">
              <label>{t("price.list.volume.range.to")}</label>
            </div>
            <div className="four wide field required">
              <label>{t("price.list.volume.range.name")}</label>
            </div>
          </div>
          <ListField name="ranges">
            <ListItemField name="$" label={null}>
              <NestField
                grouped={false}
                label={null}
                className="range"
                name=""
                style={{ margin: undefined }}
              >
                <NumField name="from" className="four wide" label={null} />
                <NumField name="to" className="four wide" label={null} />
                <AutoField name="name" className="four wide" label={null} />
                <ListDelField className="two wide" name="" />
              </NestField>
            </ListItemField>
          </ListField>
        </div>
        <br />
        {!disabled && <ListAddField name="ranges.$" label={t("price.list.volume.range.add")} />}

        <ErrorsField />
      </AutoForm>
      {!disabled && (
        <a onClick={() => setShowGenerateTool(!showGenerateTool)} style={{ cursor: "pointer" }}>
          Generate from parameters... .
        </a>
      )}
      {showGenerateTool && !disabled && (
        <Segment secondary>
          <Form>
            <Form.Group>
              <Form.Field width={4}>
                <label>From</label>

                <Input
                  type="number"
                  value={formState.from}
                  onChange={(_, { value: from }) => setFormState({ ...formState, from })}
                />
              </Form.Field>
              <Form.Field width={4}>
                <label>To</label>

                <Input
                  type="number"
                  value={formState.to}
                  onChange={(_, { value: to }) => setFormState({ ...formState, to })}
                />
              </Form.Field>
              <Form.Field width={4}>
                <label>Step</label>

                <Input
                  type="number"
                  value={formState.step}
                  onChange={(_, { value: step }) => setFormState({ ...formState, step })}
                />
              </Form.Field>
              <Form.Field width={2}>
                <Button
                  content="GO"
                  onClick={e => {
                    e.stopPropagation();
                    generate();
                  }}
                />
              </Form.Field>
            </Form.Group>
          </Form>
        </Segment>
      )}
    </>
  );
};

VolumeGroupForm.propTypes = {
  data: PropTypes.object,
  onSubmitForm: PropTypes.func,
  formRef: PropTypes.func,
  disabled: PropTypes.bool
};

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (props.index > -1) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`price.list.volume.${l}`} />;
}

const VolumeGroupmodal = ({ ...props }) => {
  const [isSaving, setSaving] = useState(false);
  const { show, isLocked, index, showModal, volume, volumes, onSave } = props;
  const title = generateTitle(props);

  const onSubmitForm = data => {
    let mod = volumes || [];
    setSaving(true);

    if (index > -1) {
      mod = mod.map((item, i) => (i === index ? data : item));
    } else {
      mod = [...mod, data];
    }
    debug("volumes update: %o", mod);
    onSave({ volumes: mod });
  };

  const onDelete = () => {
    const mod = volumes.filter((item, i) => i !== index);
    onSave({ volumes: mod });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={
        <VolumeGroupForm
          {...{ data: volume, volumes, disabled: isLocked || isSaving, onSubmitForm }}
        />
      }
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!volume && (
            <ModalActionsDelete
              {...{
                showModal,
                disabled: isSaving,
                onSave: () => formRef.submit(),
                onDelete: () => onDelete(index)
              }}
            />
          )}
          {!isLocked && !volume && (
            <ModalActions {...{ showModal, disabled: isSaving, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default VolumeGroupmodal;
