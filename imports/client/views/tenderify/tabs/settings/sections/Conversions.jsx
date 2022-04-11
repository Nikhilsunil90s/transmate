import React from "react";
import { tabProptypes } from "../../../utils/propTypes";
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
import { SelectField } from "/imports/client/components/forms/uniforms";
import { TenderBidConversion } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender-bid";
import { Trans } from "react-i18next";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    conversions: { type: Array },
    "conversions.$": { type: TenderBidConversion }
  })
);

const Conversions = ({ tenderBid, security }) => {
  return (
    <IconSegment
      title="Conversions"
      icon="exchange"
      body={
        <AutoForm
          schema={schema}
          disabled={!security.editGeneral}
          model={{ conversions: tenderBid.settings?.conversions || [] }}
        >
          <ListField name="conversions">
            <ListItemField name="$">
              <Form.Group widths={4}>
                <SelectField name="from" />
                <SelectField name="to" />
                <AutoField name="factor" />
                <ListDelField name="" />
              </Form.Group>
            </ListItemField>
          </ListField>

          <ListAddField name="conversions.$" label={<Trans i18nKey="form.add" />} />
          <ErrorsField />
        </AutoForm>
      }
      footer={<Button primary content={<Trans i18nKey="form.save" />} />}
    />
  );
};

Conversions.propTypes = {
  ...tabProptypes
};

export default Conversions;
