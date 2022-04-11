import React from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoField, AutoForm, ErrorsField } from "uniforms-semantic";
import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AddressInputSchema } from "/imports/client/components/forms/input/Address.schema.js";
import { Divider, Grid } from "semantic-ui-react";
import { DropdownCountryFlagField } from "/imports/client/components/forms/uniforms";

let formRef;
const AddressForm = ({ onSubmitForm, location, onFieldChanged, disabledForm, forwardRef }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(AddressInputSchema)}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;

        // eslint-disable-next-line no-unused-expressions
        forwardRef && typeof forwardRef === "function" && forwardRef(ref);
      }}
      model={{
        name: location.name,
        countryCode: location.countryCode,
        ...location.address
      }}
      onChange={onFieldChanged}
    >
      <AddressInput
        name="location"
        label={t("shipment.stage.stop")}
        options={{ excludeGlobal: true }}
        noAdd
        disabled={disabledForm === "location"}
      />

      <Divider horizontal>Or</Divider>

      <Grid divided="vertically">
        <Grid.Row columns={3}>
          <Grid.Column>
            <AutoField name="name" disabled={disabledForm === "override"} />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="street" disabled={disabledForm === "override"} />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="city" disabled={disabledForm === "override"} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={2}>
          <Grid.Column>
            <DropdownCountryFlagField name="countryCode" disabled={disabledForm === "override"} />
          </Grid.Column>
          <Grid.Column>
            <AutoField name="number" disabled={disabledForm === "override"} />
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
        <AddressForm
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
