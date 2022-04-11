import React from "react";
import SimpleSchema from "simpl-schema";
import { Button, Icon } from "semantic-ui-react";
import { AutoForm, AutoFields } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ModalActions } from "./modalActions";

import PageHolder from "../utilities/PageHolder";
import initializeModal from "./Modal";

export default {
  title: "Components/modals"
};

export const basic = () => {
  const { ModalTrigger } = initializeModal();
  return (
    <PageHolder main="Shipment">
      <ModalTrigger title="test" body={<div>TestDiv</div>}>
        <Button primary>
          <Icon name="add" />
          Create
        </Button>
      </ModalTrigger>
    </PageHolder>
  );
};

export const basicForm = () => {
  const { ModalTrigger, showModal } = initializeModal();
  let formRef;
  const handleSubmitForm = model => {
    console.log(model);
    showModal(false);
  };

  // test form:
  const schema = new SimpleSchema2Bridge(
    new SimpleSchema({
      firstName: String,
      lastName: String,
      country: {
        type: String,
        allowedValues: ["Poland", "England"],
        defaultValue: "Poland"
      }
    })
  );
  const TestForm = (
    <AutoForm
      schema={schema}
      onSubmit={handleSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoFields />
    </AutoForm>
  );

  // testForm

  const onSave = () => {
    formRef.submit();
  };
  return (
    <PageHolder main="Shipment">
      <ModalTrigger
        title="test with form"
        body={TestForm}
        actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
      >
        <Button primary>
          <Icon name="add" />
          Create
        </Button>
      </ModalTrigger>
    </PageHolder>
  );
};
