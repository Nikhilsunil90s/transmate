import React from "react";
import { Grid } from "semantic-ui-react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoField, AutoForm, TextField, SubmitField } from "uniforms-semantic";
import { AutoCompleteField, SelectField } from ".";
import {
  ListItemField,
  ListField,
  ListAddField,
  ListDelField
} from "/imports/client/components/forms/uniforms/ListField";

export default {
  title: "Components/Forms"
};

const createShipmentSchema = new SimpleSchema2Bridge(
  new SimpleSchema({
    type: { type: String },
    title: { type: String },
    year: { type: String }
  })
);

export const uniforms = () => (
  <AutoForm
    schema={createShipmentSchema}
    model={{ type: "582" }}
    onSubmit={console.log}
  >
    <Grid>
      <Grid.Row>
        <Grid.Column width={9}>
          <AutoCompleteField
            name="type"
            category
            options={[
              {
                name: "Coca Cola",
                results: [
                  { title: "Quench", value: "2342", group: "Coca Cola" },
                  { title: "Your", value: "234", group: "Coca Cola" },
                  { title: "Thirst", value: "454", group: "Coca Cola" }
                ]
              },
              {
                name: "Power Ship",
                results: [
                  { title: "Where", value: "923", group: "Power Ship" },
                  { title: "Quality", value: "582", group: "Power Ship" },
                  { title: "Costs", value: "290", group: "Power Ship" },
                  { title: "Less", value: "823", group: "Power Ship" }
                ]
              }
            ]}
          />
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={6}>
          <AutoField name="title" />
        </Grid.Column>

        <Grid.Column width={6}>
          <SelectField
            name="year"
            allowedValues={["2019", "2020", "2021"]}
            defaultValue="2020"
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </AutoForm>
);

const listFieldsSchema = new SimpleSchema2Bridge(
  new SimpleSchema({
    arrField: { type: Array, optional: true },
    "arrField.$": { type: String },
    arrFieldObj: { type: Array, optional: true },
    "arrFieldObj.$": {
      type: new SimpleSchema({
        name: String,
        age: Number
      })
    }
  })
);

export const listFields = () => {
  return (
    <AutoForm
      schema={listFieldsSchema}
      model={{ arrField: ["test"], arrFieldObj: [{ name: "phil", age: 30 }] }}
      onSubmit={console.log}
    >
      <ListField name="arrField">
        <ListItemField name="$">
          <div className="fields">
            <TextField name="" className="ten wide" />
            <ListDelField />
          </div>
        </ListItemField>
      </ListField>
      <ListAddField name="arrField.$" />
      <ListField name="arrFieldObj">
        <ListItemField name="$">
          <div className="three fields">
            <AutoField name="name" />
            <AutoField name="age" />
            <ListDelField />
          </div>
        </ListItemField>
      </ListField>
      <ListAddField name="arrFieldObj.$" />
      <SubmitField />
    </AutoForm>
  );
};
