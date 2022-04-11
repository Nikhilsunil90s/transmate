import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, SubmitField } from "uniforms-semantic";

import PageHolder from "../../utilities/PageHolder";
import CurrencyAmount from "./CurrencyAmountInput.jsx";

export default {
  title: "Components/Forms/currencyAmountInput"
};

const dummyProps = {
  data: { amount: { value: 100, unit: "USD" } },
  onSubmitForm: console.log,
  currencyProps: {
    disabled: false
  }
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    amount: { type: Object, label: "Amount" },
    "amount.value": Number,
    "amount.unit": String
  })
);

// as part of a uniforms:
export const basic = () => {
  const { data, onSubmitForm } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <CurrencyAmount name="amount" />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const empty = () => {
  const { onSubmitForm } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={{}} schema={schema} onSubmit={onSubmitForm}>
        <CurrencyAmount name="amount" />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const lockedCurrency = () => {
  const { onSubmitForm } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={{}} schema={schema} onSubmit={onSubmitForm}>
        <CurrencyAmount name="amount" options={{ disableCurrency: true }} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
