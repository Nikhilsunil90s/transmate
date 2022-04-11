/* eslint-disable no-unused-vars */
import React from "react";
import { Form, Header, Segment } from "semantic-ui-react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField } from "uniforms-semantic";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    maxVendorCount: Number,
    minimalShare: Number,
    minQuantity: Number,
    minSpend: Number,
    maxSpend: Number,
    maxLotGroups: Number
  })
);

let formRef;
const CreateScenarioTab = ({ ...props }) => {
  const { scenario = {}, onSave, security } = props;
  const { canEdit } = security;

  const handleFormSubmit = ({ name, currency }) => {
    onSave({
      name,
      params: { currency }
    });
  };

  return (
    <>
      <Segment padded="very" className="options" data-test="optionsSegment">
        <Header as="h3" content="Scenario build" />
        <AutoForm
          disabled={!canEdit}
          schema={schema}
          model={{
            maxVendorCount: 3,
            minimalShare: 30,
            minQuantity: null,
            minSpend: 12000,
            maxSpend: 500000,
            maxLotGroups: 90
          }}
          onSubmit={handleFormSubmit}
          ref={ref => {
            formRef = ref;
          }}
        >
          <Form.Group widths="equal">
            <AutoField name="maxVendorCount" label="max vendors" />
            <AutoField name="minimalShare" label="min. share" />
            <AutoField name="minQuantity" label="min quantity" />
          </Form.Group>
          <Form.Group widths="equal">
            <AutoField name="minSpend" label="min spend" />
            <AutoField name="maxSpend" label="max spend" />
            <AutoField name="maxLotGroups" label="max lot groups" />
          </Form.Group>
        </AutoForm>
      </Segment>
    </>
  );
};

export default CreateScenarioTab;
