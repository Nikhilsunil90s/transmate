/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm } from "uniforms-semantic";

import initializeModal from "../Modal";
import { ModalActions } from "../modalActions";
import PartnerSelectField from "/imports/client/components/forms/uniforms/PartnerSelect.jsx";

let formRef;

/** if multiple -> returned value is array */
const SelectPartnerModal = ({
  options, // query options
  value,
  multiple,
  onSave: onSavePartner,
  children: trigger
}) => {
  const { t } = useTranslation();
  const { ModalTrigger, showModal } = initializeModal();

  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ partnerId }) => {
    onSavePartner({ partnerId }, () => showModal(false));
    showModal(false); // TODO: remove me, make sure cb is called
  };

  return (
    <ModalTrigger
      title={t("tender.partner.add")}
      body={<PartnerForm {...{ options, onSave: onSubmitForm, value, multiple }} />}
      actions={<ModalActions {...{ onSave, showModal }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

const PartnerForm = ({ options = {}, onSave, value, multiple }) => {
  // eslint-disable-next-line no-unused-vars
  const [data, setRefData] = useState([]);
  const { t } = useTranslation();
  const model = { partnerId: value };

  const onSubmitForm = ({ partnerId }) => {
    // const partner = (data || []).find(({ key }) => key === partnerId) || {};
    onSave({
      partnerId
    });
  };

  return (
    <AutoForm
      schema={multiple ? schemaMultiple : schemaSingle}
      onSubmit={onSubmitForm}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
    >
      <PartnerSelectField
        name="partnerId"
        fluid
        options={options}
        multiple={multiple}
        label={t("tender.partner.name")}
        setRefData={setRefData}
        placeholder={t("tender.partner.select")}
      />
    </AutoForm>
  );
};

const schemaSingle = new SimpleSchema2Bridge(
  new SimpleSchema({
    partnerId: String
  })
);

const schemaMultiple = new SimpleSchema2Bridge(
  new SimpleSchema({
    partnerId: { type: Array },
    "partnerId.$": { type: String }
  })
);

export default SelectPartnerModal;
