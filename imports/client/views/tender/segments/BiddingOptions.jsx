import React, { useState } from "react";
import { Trans } from "react-i18next";

import { Button } from "semantic-ui-react";
import { AutoForm, SelectField } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";

import { BID_OPTIONS } from "/imports/api/_jsonSchemas/enums/tender";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { SelectPriceListField } from "/imports/client/components/forms/uniforms";

const debug = require("debug")("tender:UI");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    types: {
      type: Array,
      minCount: 1,
      uniforms: {
        checkboxes: true
      }
    },
    "types.$": {
      type: String,
      uniforms: {
        options: BID_OPTIONS.map(option => ({
          label: option,
          value: option
        }))
      }
    },
    priceListId: { type: String, optional: true }
  })
);

let formRef;
const BiddingOptionsForm = ({ tender, onSave }) => {
  const model = tender?.params?.bid || {};
  const showPL = (model.types || []).includes("priceList");
  const [showPLSelect, setShowPLSelect] = useState(showPL);

  debug("model data %o", model);

  const onSubmitform = formData => onSave({ "params.bid": formData });
  return (
    <AutoForm
      onChange={(key, value) => {
        if (key === "types") {
          if ((value || []).includes("priceList")) {
            setShowPLSelect(true);
          } else {
            setShowPLSelect(false);
          }
        }
      }}
      onSubmit={onSubmitform}
      schema={schema}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
      showInlineError
    >
      <SelectField name="types" label="allow values from" />
      {showPLSelect && <SelectPriceListField name="priceListId" />}
    </AutoForm>
  );
};

const BiddingOptionsSegment = ({ ...props }) => {
  return (
    <IconSegment
      name="summary"
      icon="paperclip"
      title={<Trans i18nKey="tender.options.title" />}
      body={<BiddingOptionsForm {...props} />}
      footer={
        <Button primary onClick={() => formRef.submit()} content={<Trans i18nKey="form.save" />} />
      }
    />
  );
};

export default BiddingOptionsSegment;
