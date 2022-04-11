import React from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm } from "uniforms-semantic";
import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AddressInputSchema } from "/imports/client/components/forms/input/Address.schema.js";

let formRef;
const AddressForm = ({ onSubmitForm }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(AddressInputSchema)}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AddressInput
        name="location"
        label={t("shipment.stage.stop")}
        options={{ excludeGlobal: true }}
        noAdd
      />
    </AutoForm>
  );
};

// onSubmitForm
const AddressModal = ({ ...props }) => {
  const { show, showModal, title, onSubmitForm } = props;

  return (
    <ModalComponent
      title={title}
      show={show}
      showModal={showModal}
      body={<AddressForm {...props} onSubmitForm={onSubmitForm} />}
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
