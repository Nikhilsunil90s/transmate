import React from "react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { AutoForm, AutoField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Button, Grid } from "semantic-ui-react";
import { SelectFuelModelField, LabeledField } from "/imports/client/components/forms/uniforms";
import { tabProptypes } from "../../../utils/propTypes";

import { Trans } from "react-i18next";

// check: customer fuel model
// check: own model
// connected fuel model (dropdown)

const schema = new SimpleSchema2Bridge(
  new SimpleSchema(
    {
      fuelSource: {
        type: String,
        allowedValues: ["customer", "own"],
        defaultValue: "own",
        uniforms: { checkboxes: true, inline: true }
      },
      customerFuelPct: Number,
      linkedFuelId: String
    },
    { requiredByDefault: false }
  )
);

const Fuel = props => {
  return (
    <IconSegment
      title="Fuel"
      label="drop"
      body={
        <AutoForm
          schema={schema}
          model={{
            fuelSource: "customer",
            customerFuelPct: 3,
            linkedFuelId: "sscxbzwqdnHwPez5L"
          }}
        >
          <Grid columns={2}>
            <Grid.Column>
              <AutoField name="fuelSource" />
            </Grid.Column>
            <Grid.Column>
              <LabeledField name="customerFuelPct" inputLabel="%" />
              <SelectFuelModelField name="linkedFuelId" />
            </Grid.Column>
          </Grid>
        </AutoForm>
      }
      footer={<Button primary content={<Trans i18nKey="form.save" />} />}
    />
  );
};

Fuel.propTypes = tabProptypes;

export default Fuel;
