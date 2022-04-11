import { gql, useQuery } from "@apollo/client";
import React from "react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Form, Input } from "semantic-ui-react";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import { ListItemField, ListField } from "/imports/client/components/forms/uniforms/ListField";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { fragments as workflowTypeSettings } from "/imports/api/settings/apollo/fragments.js";
import { SelectField, RichTextEditor } from "/imports/client/components/forms/uniforms";
import { DateTimeField } from "/imports/client/components/forms/uniforms/DateInput.jsx";

import { connectField } from "uniforms";

export const GET_WORKFLOW_TYPES = gql`
  query getSettingsWorkflowTypes {
    workflowSettings: getSettings(key: "workflowTypes") {
      ...workflowTypeSettings
    }
  }
  ${workflowTypeSettings.workflowTypeSettings}
`;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    workflowId: String,
    inputs: { type: Array, optional: true },
    "inputs.$": {
      type: new SimpleSchema({
        id: String,
        type: String,
        value: String,

        // bridges for entry:
        valueDate: { optional: true, type: Date },
        valueNote: { optional: true, type: String }
      })
    }
  })
);

const dynamicField = props => {
  const { value, onChange, error } = props;
  const { type, id, value: v, valueDate, valueNote } = value || {};
  const onChangeHandler = updateObj => {
    onChange({ ...value, ...updateObj });
  };

  // TODO [$6130a08837762e00094fd3dd]: what to do with the v?
  console.error(error, v);
  switch (type) {
    case "richText":
      return (
        <>
          <label>{id}</label>
          <RichTextEditor
            name="value"
            value={valueNote}
            onChange={data => onChangeHandler({ valueNote: JSON.stringify(data) })}
            style={{
              height: 150
            }}
          />
        </>
      );
    case "dateTime":
      return (
        <>
          <label>{id}</label>
          <DateTimeField
            onChange={date => onChangeHandler({ valueDate: date })}
            value={valueDate}
          />
        </>
      );
    case "userIds": // TODO > make a dynamic selector
    default:
      return (
        <>
          <label>{id}</label>
          <Input
            name="value"
            onChange={({ value: newVal }) => onChangeHandler({ value: newVal })}
          />
        </>
      );
  }
};
const DynamicField = connectField(dynamicField);

let formRef;
export const WorkFlowForm = ({ workflowTypes, formRef: formRefProp }) => {
  const workflowOptions = workflowTypes.map(({ id, label }) => ({ value: id, text: label }));
  const onChangeWorkflowId = workflowId => {
    formRef.change("workflowId", workflowId);
    const def = workflowTypes.find(({ id }) => id === workflowId);

    if (def?.inputs?.length) {
      formRef.change(
        "inputs",
        def.inputs.map(({ id, type }) => ({ id, type }))
      );
    }
  };

  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;

        // eslint-disable-next-line no-unused-expressions
        formRefProp && formRefProp(ref);
      }}
    >
      <SelectField name="workflowId" options={workflowOptions} onChange={onChangeWorkflowId} />

      <ListField name="inputs">
        <ListItemField name="$">
          <Form.Field>
            <DynamicField />
          </Form.Field>
        </ListItemField>
      </ListField>
      <ErrorsField />
    </AutoForm>
  );
};

const WorkflowModal = ({ show, showModal, title, onSave }) => {
  const { data, loading, error } = useQuery(GET_WORKFLOW_TYPES);
  const workflowTypes = data?.workflows || [];

  if (error) console.error({ error });

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<WorkFlowForm workflowTypes={workflowTypes} loading={loading} onSave={onSave} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default WorkflowModal;
