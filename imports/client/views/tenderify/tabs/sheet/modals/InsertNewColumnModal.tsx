import React from "react";
import {
  AutoForm,
  AutoField,
  ErrorsField,
  RadioField
} from "uniforms-semantic";
import { Form } from "semantic-ui-react";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import StaticField from "/imports/client/components/forms/uniforms/StaticField";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";
import { constructColumnKey } from "../utils/constructNewColumnKey";
import capitalize from "lodash.capitalize";
import { SelectField } from "/imports/client/components/forms/uniforms";

// FIXME: translations

const schema = initJSONschema({
  title: "InsertNewColumnModalSchema",
  type: "object",
  properties: {
    name: { type: "string" },
    key: { type: "string" },
    defaultValue: { type: "number" },
    operation: { type: "string" },
    refColumn: { type: "string" }
  },
  required: ["name"]
});

interface FormModel {
  name: string;
  key: string;
  defaultValue?: number;
  operation: "add" | "multiply" | "none";
  refColumn?: string;
}

interface AvailableColumn {
  dataKey: string;
  label: string;
}
interface InsertNewColumnModalProps {
  show: boolean;
  showModal: (a: boolean) => void;
  existingCalculationColumns?: string[];
  availableBidColumns: AvailableColumn[];
  onSave: (a: FormModel) => void;
}

let formRef;
const InsertNewColumnForm = ({
  onSave,
  existingCalculationColumns,
  availableBidColumns = []
}) => {
  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
      onChange={(key: string, value: string) => {
        // set the slug based on the entered name
        if (key === "name") {
          const slugValue = constructColumnKey(
            value,
            existingCalculationColumns
          );
          formRef.change("key", slugValue);
        }
      }}
      onSubmit={onSave}
    >
      <Form.Group columns={3}>
        <AutoField name="name" label="Name" />
        <AutoField name="defaultValue" label="Default value (numeric)" />
        <StaticField name="key" label="Key:" />
      </Form.Group>
      <Form.Group widths={2}>
        {/* @ts-ignore FIXME */}
        <SelectField
          name="refColumn"
          options={availableBidColumns.map((l: AvailableColumn) => ({
            value: l.dataKey,
            text: l.label
          }))}
        />
        <RadioField
          name="operation"
          allowedValues={["add", "multiply", "none"]}
          transform={(value: string) => capitalize(value)}
        />
      </Form.Group>

      <ErrorsField />
    </AutoForm>
  );
};

const InsertNewColumnModal = ({
  show,
  showModal,
  existingCalculationColumns,
  availableBidColumns,
  onSave
}: InsertNewColumnModalProps) => {
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title="Insert new Column"
      body={
        <InsertNewColumnForm
          onSave={onSave}
          existingCalculationColumns={existingCalculationColumns}
          availableBidColumns={availableBidColumns}
        />
      }
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit()
          }}
        />
      }
      trigger={undefined}
      scrolling={undefined}
    />
  );
};

export default InsertNewColumnModal;
