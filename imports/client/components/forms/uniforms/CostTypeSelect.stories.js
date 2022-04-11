import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, SubmitField } from "uniforms-semantic";
import { connectField } from "uniforms";

import PageHolder from "../../utilities/PageHolder";
import { CostTypeSelect, prepareData } from "./CostTypeSelect.jsx";

export default {
  title: "Components/Forms/costTypeSelect"
};

const CostTypeSelectField = connectField(CostTypeSelect);

const dbCostsResult = [
  {
    _id: "zPp9EFKgSgtA4boXW",
    type: "additional",
    group: "goods",
    cost: "dimensions"
  },
  {
    _id: "zNxkWvLEkEKTXgZdy",
    type: "additional",
    group: "fuel",
    cost: "lowSulphurSurcharge",
    aliases: [{ description: "Low sulfur surcharge" }]
  },
  {
    _id: "yroo72ifiiYDzN9Yt",
    type: "additional",
    group: "customs",
    cost: "warehouse"
  },
  {
    _id: "yHnRo44QYsdEJiqG6",
    type: "additional",
    group: "service",
    cost: "checking"
  },
  {
    _id: "xXEJrg57wRAquAzNr",
    type: "additional",
    group: "customs",
    cost: "overtime"
  },
  {
    _id: "wmmiS7DtHrdpyg4mr",
    type: "additional",
    group: "documentation",
    cost: "other"
  },
  {
    _id: "wKqKkn5aaqtpAEJyX",
    type: "additional",
    group: "service",
    cost: "entry"
  },
  {
    _id: "wJBPnHaZmXPjZFSDf",
    type: "additional",
    group: "connection",
    cost: "collection"
  },
  {
    _id: "vFfEgGEk5Qvw3kybt",
    type: "additional",
    group: "connection",
    cost: "congestion Surcharge"
  },
  {
    _id: "uBSuR7nfHk9kPSb4P",
    type: "additional",
    group: "connection",
    cost: "access"
  }
];
const dummyProps = {
  data: {},
  onSubmitForm: console.log,
  costOptions: prepareData(dbCostsResult)
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    costId: { type: String, label: "Cost type" }
  })
);

// as part of a uniforms:
export const basic = () => {
  const { data, onSubmitForm, costOptions } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <CostTypeSelectField name="costId" options={costOptions} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
