import React, { useState } from "react";
import { Random } from "/imports/utils/functions/random.js";
import { useQuery } from "@apollo/client";
import { useTranslation, Trans } from "react-i18next";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import {
  ModalComponent,
  ModalActions,
  ModalActionsDelete,
  ModalActionsClose
} from "/imports/client/components/modals";
import { EquipmentDefinitionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListEquipmentDefinition.js";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

import { GET_ITEM_TYPES } from "../utils/queries";

const schema = new SimpleSchema2Bridge(EquipmentDefinitionSchema.pick("name", "types"));

const debug = require("debug")("scope");

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (props.index > -1) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`price.list.equipment.${l}`} />;
}

let formRef;
export const EquipmentForm = ({ equipment = {}, onSubmitForm }) => {
  const { t } = useTranslation();
  const formModel = {
    id: Random.id(6),
    ...equipment
  };
  const { data = {}, loading, error } = useQuery(GET_ITEM_TYPES);
  if (error) console.error(`>>>>>>> error`, error);
  const equipmentOptions = (data.itemTypes || [])
    .filter(({ type }) => type === "TU")
    .map(item => {
      let label = item.code;
      if (item.name) {
        label += `${item.name}`;
      }
      return { value: item.code, text: label };
    });
  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
      model={formModel}
      onSubmit={onSubmitForm}
    >
      <Form.Group widths="equal">
        <AutoField name="name" label={t("price.list.equipment.name")} />
        <SelectField name="types" loading={loading} multiple options={equipmentOptions} />
      </Form.Group>
      <ErrorsField />
    </AutoForm>
  );
};

const EquipmentModal = ({ ...props }) => {
  const [isSaving, setSaving] = useState(false);
  const { show, isLocked, index, showModal, equipment, equipments, onSave } = props;
  const title = generateTitle(props);
  const onSubmitForm = data => {
    let mod = equipments || [];
    setSaving(true);

    if (index > -1) {
      mod = mod.map((item, i) => (i === index ? data : item));
    } else {
      mod = [...mod, data];
    }
    debug("update: %o", mod);
    onSave({ equipments: mod });
  };

  const onDelete = () => {
    const mod = equipments.filter((item, i) => i !== index);
    onSave({ equipments: mod });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<EquipmentForm {...{ equipment, disabled: isLocked, onSubmitForm }} />}
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!equipment && (
            <ModalActionsDelete
              {...{
                showModal,
                disabled: isSaving,
                onSave: () => formRef.submit(),
                onDelete: () => onDelete(index)
              }}
            />
          )}
          {!isLocked && !equipment && (
            <ModalActions {...{ showModal, disabled: isSaving, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default EquipmentModal;
