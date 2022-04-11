import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, SubmitField } from "uniforms-semantic";

import PageHolder from "../../utilities/PageHolder";
import DateTimeField, {
  DateField,
  TimeField,
  DateTimeComboField
} from "./DateInput.jsx";

export default {
  title: "Components/Forms/dateInput"
};

const dummyProps = {
  data: { dateTime: new Date("2018-03-08T12:00:00.000Z") },
  onSubmitForm: args => {
    console.log("submit", args);
  },
  dateProps: {
    disabled: false
  }
};

const dummyPropsFromDb = {
  data: { dateTime: "2018-03-09T13:00:00.000Z" },
  onSubmitForm: args => {
    console.log("submit", args);
  },
  dateProps: {
    disabled: false
  }
};

const dummyPropsNotSet = {
  data: { dateTime: "" },
  onSubmitForm: args => {
    console.log("submit", args);
  },
  dateProps: {
    disabled: false
  }
};

const dummyPropsFromgraphql = {
  data: { dateTime: 1607981797699 },
  onSubmitForm: args => {
    console.log("submit", args);
  },
  dateProps: {
    disabled: false
  }
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    dateTime: {
      type: Date,
      label: "date"
    }
  })
);

// as part of a uniforms:
export const dateField = () => {
  const { data, onSubmitForm, dateProps } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateField name="dateTime" {...dateProps} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

// as part of a uniforms:
export const dateFieldGraphql = () => {
  const { data, onSubmitForm, dateProps } = dummyPropsFromgraphql;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateField name="dateTime" {...dateProps} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const timeField = () => {
  const { data, onSubmitForm, dateProps } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <TimeField name="dateTime" {...dateProps} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const dateTimeField = () => {
  const { data, onSubmitForm, dateProps } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateTimeField name="dateTime" {...dateProps} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const dateTimeComboField = () => {
  const { data, onSubmitForm, dateProps } = dummyProps;
  const props = {
    ...dateProps,
    dateLabel: "date label",
    timeLabel: "time label"
  };

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateTimeComboField name="dateTime" {...props} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const dateTimeComboFieldFromDb = () => {
  const { data, onSubmitForm, dateProps } = dummyPropsFromDb;
  const props = {
    ...dateProps,
    dateLabel: "date label",
    timeLabel: "time label"
  };

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateTimeComboField name="dateTime" {...props} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const comboDateNotSet = () => {
  const { data, onSubmitForm, dateProps } = dummyPropsNotSet;
  const props = {
    ...dateProps,
    dateLabel: "date label",
    timeLabel: "time label"
  };

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <DateTimeComboField name="dateTime" {...props} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
