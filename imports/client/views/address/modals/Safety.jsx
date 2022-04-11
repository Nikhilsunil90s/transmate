import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Divider, Table, Image, Checkbox, Header } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { connectField } from "uniforms";
import { AutoForm } from "uniforms-semantic";
import { RichTextField, initSlateValue } from "/imports/client/components/forms/uniforms";
import get from "lodash.get";

import { PBM } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_location";

let formRef;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    pbm: { type: Array },
    "pbm.$": { type: String },
    instructions: { type: String, optional: true }
  })
);

const safetySelectField = ({ onChange, value }) => {
  let valMod = value || [];

  const handleCheck = (checked, item) => {
    if (checked) {
      valMod = [...valMod, item];
    } else {
      valMod = valMod.filter(cur => cur !== item);
    }

    onChange(valMod);
  };

  return (
    <Table>
      <Table.Body>
        <Table.Row>
          {(PBM || []).map((item, i) => (
            <Table.Cell
              key={i}
              content={
                <div style={{ textAlign: "center" }}>
                  <Image size="mini" src={`/safety-icons/${item}.svg`} />{" "}
                </div>
              }
            />
          ))}
        </Table.Row>
        <Table.Row>
          {(PBM || []).map((item, i) => (
            <Table.Cell
              key={i}
              content={
                <Checkbox
                  fitted
                  checked={valMod.includes(item)}
                  onChange={(_, { checked }) => handleCheck(checked, item)}
                />
              }
            />
          ))}
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

export const SafetySelectField = connectField(safetySelectField);

const AddressSafetyForm = ({ annotation = {}, onSubmitForm }) => {
  const { t } = useTranslation();
  const data = {
    instructions: initSlateValue(get(annotation, ["safety", "instructions"])),
    pbm: get(annotation, ["safety", "pbm"], [])
  };

  return (
    <AutoForm
      schema={schema}
      model={data}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
      modelTransform={(mode, model) => {
        if (["submit", "validate"].includes(mode)) {
          return {
            ...model,
            instructions: JSON.stringify(model.instructions)
          };
        }
        return model;
      }}
    >
      <Header as="h4" dividing content={t("address.form.safety.protection")} />
      <SafetySelectField name="pbm" />
      <Divider hidden />
      <Header as="h4" dividing content={t("address.form.safety.instructions")} />
      <RichTextField name="instructions" />
    </AutoForm>
  );
};

const AddressSafetyModal = ({ show, showModal, annotation = {}, onSubmitForm }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("address.form.safety.edit")}
      body={<AddressSafetyForm {...{ annotation, onSubmitForm }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

AddressSafetyModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  address: PropTypes.object
};

export default AddressSafetyModal;
