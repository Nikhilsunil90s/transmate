/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

let formRef;

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    group: String,
    cost: String
  })
);

export const CostForm = ({ cost, onSave }) => {
  const onSubmitForm = formData => {
    onSave(formData);
  };

  return (
    <AutoForm
      schema={schema}
      model={cost}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths={2}>
        <AutoField name="cost" />
        <AutoField name="group" />
      </Form.Group>
    </AutoForm>
  );
};

const CostsModal = ({ cost, showModal, show, onSave }) => {
  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="settings.data.costs.modalTitle" />}
      showModal={showModal}
      body={<CostForm {...{ cost, onSave }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default CostsModal;
