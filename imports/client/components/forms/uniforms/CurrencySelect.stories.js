import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, SubmitField } from "uniforms-semantic";

import PageHolder from "../../utilities/PageHolder";
import CurrencySelect from "./CurrencySelect.jsx";

export default {
  title: "Components/Forms/currencySelect"
};

const dummyProps = {
  data: { phone: undefined },
  onSubmitForm: console.log,
  currencyProps: {
    disabled: false
  }
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    currency: {
      type: String,
      label: "Currency"
    }
  })
);

// as part of a uniforms:
export const basic = () => {
  const { data, onSubmitForm, currencyProps } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <CurrencySelect name="currency" {...currencyProps} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
