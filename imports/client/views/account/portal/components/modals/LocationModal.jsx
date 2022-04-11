import React from "react";
import { Form } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { PortalSchema } from "../../utils/schema";
import { DropdownCountryFlagField, SelectField } from "/imports/client/components/forms/uniforms";
import { startCase } from "../../utils/helpers";

const schema = new SimpleSchema2Bridge(PortalSchema.getObjectSchema("locations.$"));

let formRef;
const LocationForm = ({ location, onSave }) => {
  return (
    <AutoForm
      model={location}
      schema={schema}
      onSubmit={onSave}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group>
        <AutoField name="name" className="eight wide" />
        <SelectField name="locationType" transform={startCase} />
      </Form.Group>
      <AutoField name="street" width={8} />
      <Form.Group>
        <AutoField name="city" width={6} />
        <AutoField name="zip" width={4} />
        <DropdownCountryFlagField name="cc" label="country" className="six wide" />
      </Form.Group>

      <ErrorsField />
    </AutoForm>
  );
};

const LocationModal = ({ location, index, showModal, show, onSave }) => {
  const title = index > -1 ? "Edit location" : "Add location";
  const onSubmit = updates => {
    onSave(updates, index);
  };
  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={<LocationForm {...{ location, onSave: onSubmit }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default LocationModal;
