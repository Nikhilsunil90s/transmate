import React from "react";
import get from "lodash.get";
import { AutoField, AutoForm, ErrorsField } from "uniforms-semantic";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";

import { Grid } from "semantic-ui-react";

import { initJSONschema } from "/imports/utils/UI/initJSONschema";
import addressChangeSchema from "./Address.schema.json";

const FIELD_MAP = {
  name: "name",
  companyName: "companyName",
  phoneNumber: "phoneNumber",
  zipCode: "zipCode",

  street: "address.street",
  number: "address.number",
  city: "address.city"
};

let formRef;
const AddressChangeForm = ({
  onSubmitForm,
  location,
  onFieldChanged,
  disabledForm,
  forwardRef
}) => {
  const model = Object.entries(FIELD_MAP).reduce((acc, [newKey, originalKey]) => {
    const newVal = get(location, originalKey);
    if (!!newVal) {
      acc[newKey] = newVal;
    }
    return acc;
  }, {});
  return (
    <AutoForm
      schema={initJSONschema(addressChangeSchema)}
      disabled={disabledForm}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;

        // eslint-disable-next-line no-unused-expressions
        forwardRef && typeof forwardRef === "function" && forwardRef(ref);
      }}
      model={model}
      onChange={onFieldChanged}
    >
      <Grid divided="vertically">
        <Grid.Row columns={3}>
          <Grid.Column>
            <AutoField name="name" />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="companyName" />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="phoneNumber" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            <AutoField name="street" />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="number" />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={2}>
          <Grid.Column>
            <AutoField name="zipCode" />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="city" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ErrorsField />
    </AutoForm>
  );
};

const AddressModal = ({ ...props }) => {
  const { show, showModal, title, onSubmitForm, onFieldChanged, disabledForm, forwardRef } = props;

  return (
    <ModalComponent
      title={title}
      show={show}
      showModal={showModal}
      body={
        <AddressChangeForm
          {...props}
          forwardRef={forwardRef}
          onSubmitForm={onSubmitForm}
          onFieldChanged={onFieldChanged}
          disabledForm={disabledForm}
        />
      }
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit()
          }}
        />
      }
    />
  );
};

export default AddressModal;
