import React from "react";
import PropTypes from "prop-types";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Button, Form } from "semantic-ui-react";
import {
  ListItemField,
  ListField,
  ListAddField,
  ListDelField
} from "/imports/client/components/forms/uniforms/ListField";
import { CurrencySelectField } from "/imports/client/components/forms/uniforms";
import { Trans } from "react-i18next";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    currencyExchange: { type: Array },
    "currencyExchange.$": { type: Object },
    "currencyExchange.$.from": { type: String },
    "currencyExchange.$.to": { type: String },
    "currencyExchange.$.exchange": { type: Number }
  })
);

const CurrencyExchange = props => {
  return (
    <IconSegment
      title="Currency exchanges"
      icon="exchange"
      body={
        <AutoForm
          schema={schema}
          model={{
            currencyExchange: [
              { from: "EUR", to: "USD", exchange: 1.1 },
              { from: "EUR", to: "GBP", exchange: 0.98 }
            ]
          }}
        >
          <ListField name="currencyExchange">
            <ListItemField name="$">
              <Form.Group widths={4}>
                <CurrencySelectField name="from" />
                <CurrencySelectField name="to" />
                <AutoField name="exchange" />
                <ListDelField name="" />
              </Form.Group>
            </ListItemField>
          </ListField>

          <ListAddField name="currencyExchange.$" label={<Trans i18nKey="form.add" />} />
          <ErrorsField />
        </AutoForm>
      }
      footer={<Button primary content={<Trans i18nKey="form.save" />} />}
    />
  );
};

CurrencyExchange.propTypes = {};

export default CurrencyExchange;
