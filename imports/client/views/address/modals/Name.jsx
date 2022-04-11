import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AutoForm, AutoFields } from "uniforms-semantic";
import get from "lodash.get";

let formRef;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    name: String
  })
);

const AddressNameForm = ({ address, onSubmitForm }) => {
  const model = { name: get(address, "annotation.name") };

  return (
    <AutoForm
      schema={schema}
      model={model}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoFields />
    </AutoForm>
  );
};

const AddressNameModal = ({ show, showModal, address = {}, onSubmitForm }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("address.form.name")}
      body={<AddressNameForm {...{ address, onSubmitForm }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

AddressNameModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  address: PropTypes.object
};

export default AddressNameModal;
