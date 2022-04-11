import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Button } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";

import { AccountCodingSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_account-coding.js";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import ColorPicker from "/imports/client/components/forms/uniforms/ColorPicker.jsx";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

let formRef;

/** component that allows to set coding data for a partner
 * used in partner & address with a data loader
 */

const CodingSegment = ({ data, onSave, canEdit }) => {
  const { t } = useTranslation();
  const save = () => {
    formRef.submit();
  };

  return (
    <IconSegment
      title={t("partner.profile.coding.title")}
      icon="tags"
      body={<PartnerCodingForm {...{ data, onSave, canEdit }} />}
      footer={<Button primary content={t("form.save")} onClick={save} />}
    />
  );
};

const PartnerCodingForm = ({ data, onSave, canEdit }) => {
  return (
    <AutoForm
      disabled={!canEdit}
      schema={new SimpleSchema2Bridge(AccountCodingSchema)}
      model={AccountCodingSchema.clean(data)}
      onSubmit={onSave}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths="equal">
        <AutoField name="code" label="Code" />
        <AutoField name="vendorId" label="Vendor Id." />
        <AutoField name="ediId" label="EDI Id." />
      </Form.Group>
      <Form.Field width={6}>
        <ColorPicker name="color" label="Color" />
      </Form.Field>
      <ErrorsField />
    </AutoForm>
  );
};

export default CodingSegment;
