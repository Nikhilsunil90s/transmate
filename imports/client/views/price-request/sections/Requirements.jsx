import React from "react";
import { Trans } from "react-i18next";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { Form, Button } from "semantic-ui-react";
import { AutoForm, LongTextField } from "uniforms-semantic";
import { IconSegment } from "../../../components/utilities/IconSegment";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledField.jsx";
import Toggle from "/imports/client/components/forms/uniforms/Toggle.jsx";

import { PriceRequestRequirementsSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceRequestRequirements.js";

const debug = require("debug")("price-request:requirements");

//#region components
/** rendered as static form for info */
let requirementForm;
const RequirementsForm = ({ priceRequest, onSubmitForm, canEdit }) => {
  const { requirements } = priceRequest;
  return (
    <AutoForm
      ref={ref => {
        requirementForm = ref;
      }}
      disabled={!canEdit}
      onSubmit={onSubmitForm}
      schema={new SimpleSchema2Bridge(PriceRequestRequirementsSchema)}
      model={requirements}
    >
      <div className="field">
        <label>Free days</label>
        <Form.Group widths={2}>
          <LabeledField name="freeDays.demurrage" inputLabel="days" />
          <LabeledField name="freeDays.detention" inputLabel="days" />
        </Form.Group>
        <LongTextField name="freeDays.condition" />
      </div>
      <Toggle name="customsClearance" label="Include customs clearance in bid." />
    </AutoForm>
  );
};
//#endregion

const PriceRequestRequirements = ({ priceRequest = {}, security = {}, onSave }) => {
  const { canEditRequirements } = security;
  const onSaveFooter = () => {
    requirementForm.submit();
  };

  const onSubmitForm = data => {
    const requirements = PriceRequestRequirementsSchema.clean(data);
    debug("form data", requirements);
    onSave({ update: { requirements } });
  };
  const segmentData = {
    name: "requirements",
    icon: "tasks",
    title: <Trans i18nKey="price.request.requirements.title" />,
    body: <RequirementsForm {...{ priceRequest, onSubmitForm, canEdit: canEditRequirements }} />,
    footer: <Button primary content={<Trans i18nKey="form.save" />} onClick={onSaveFooter} />
  };

  return <IconSegment {...segmentData} />;
};

export default PriceRequestRequirements;
