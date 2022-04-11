import React from "react";

import { Grid, Form } from "semantic-ui-react";
import {
  AutoField,
  AutoForm,
  LongTextField,
  ErrorsField
} from "uniforms-semantic";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";

const schema = initJSONschema({
  title: "ConfirmRequestForm",
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
    company: { type: "string" },
    notes: { type: "string" }
  },
  required: ["firstName", "lastName", "email", "company"]
});

const ConfirmForm = () => {
  return (
    <AutoForm schema={schema}>
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column>
            <Form.Group widths={2}>
              <AutoField name="firstName" />
              <AutoField name="lastName" />
            </Form.Group>
            <AutoField name="email" />
            <AutoField name="company" />
          </Grid.Column>
          <Grid.Column>
            <LongTextField name="notes" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ErrorsField />
    </AutoForm>
  );
};

export default ConfirmForm;
