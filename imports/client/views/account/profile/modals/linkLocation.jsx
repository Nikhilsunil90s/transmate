// search all unlinked addresses in my addressBook
/* eslint-disable no-use-before-define */
import React from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";

import { AutoForm } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SelectField from "../../../../components/forms/uniforms/SelectField";
import AddressInput from "../../../../components/forms/input/Address.jsx";

import initializeModal from "../../../../components/modals/Modal";
import { ModalActions } from "../../../../components/modals/modalActions";

const locationTypes = ["office", "warehouse", "crossDocking", "factory"];

let formRef;
const LinkLocationModal = ({ data, onSave, children: trigger }) => {
  const { t } = useTranslation();
  const { ModalTrigger, showModal } = initializeModal();

  const onSaveForm = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ type, location = {} }) => {
    const { id: addressId } = location; // {id: <>, type: "address"| "location"}
    onSave({ type, addressId });
    showModal(false);
  };

  const title = data ? t("account.profile.locations.edit") : t("account.profile.locations.add");

  return (
    <ModalTrigger
      title={title}
      body={<LocationForm {...{ data, onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave: onSaveForm, showModal }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

export const LocationForm = ({ data = {}, onSave }) => {
  const { t } = useTranslation();
  const onSubmitForm = formData => {
    onSave(formData);
  };

  const locationOptions = locationTypes.map(type => ({
    key: type,
    value: type,
    text: t(`account.portal.locations.types.${type}`)
  }));

  return (
    <AutoForm
      model={data}
      schema={schema}
      modelTransform={(mode, model) => {
        if (mode === "validate") {
          // debug(model);
          const { addressId } = model.location || {};

          return {
            ...model,
            location: { addressId }
          };
        }
        return model;
      }}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="type"
        className="semantic-select"
        fluid
        options={locationOptions}
        placeholder={t("form.select")}
        label={t("account.profile.location.type")}
      />
      <AddressInput
        name="location"
        label={t(`account.portal.locations.address`)}
        options={{ excludeGlobal: true, excludeLocodes: true }}
      />
    </AutoForm>
  );
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    type: {
      type: String,
      allowedValues: locationTypes
    },
    location: {
      type: Object,
      blackbox: true
    }
  })
);

export default LinkLocationModal;
