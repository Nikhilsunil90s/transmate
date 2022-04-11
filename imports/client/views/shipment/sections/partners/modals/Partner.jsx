import React, { useState } from "react";
import { AutoForm } from "uniforms";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SimpleSchema from "simpl-schema";
import { Trans, useTranslation } from "react-i18next";

import PartnerSelectField from "/imports/client/components/forms/uniforms/PartnerSelect.jsx";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

function isShipper(value) {
  return /^S/.test(value);
}

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    partnerId: String,
    role: { type: String, optional: true, allowedValues: ["shipper", "consignee"] }
  })
);

const ShipmentPartnersModal = ({ show, showModal, data = {}, onSavePartner }) => {
  const { t } = useTranslation();
  const [isVisible, setVisible] = useState(isShipper(data.partnerId));
  let formRef = null;
  function onSubmitForm({ partnerId, role }) {
    onSavePartner({ partner: { partnerId, role } });
  }
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="shipment.partners.title" />}
      body={
        <AutoForm
          schema={schema}
          model={data}
          onSubmit={onSubmitForm}
          ref={ref => {
            formRef = ref;
          }}
          onChange={(key, value) => {
            if (key === "partnerId") {
              if (isShipper(value)) {
                setVisible(true);
              } else {
                setVisible(false);
              }
            }
          }}
        >
          <PartnerSelectField
            name="partnerId"
            options={{ includeOwnAccount: true, partnerTypes: ["shipper", "provider"] }}
            label={null}
            placeholder={t("form.select")}
          />
          {isVisible && <SelectField name="role" transform={role => t(`shipment.${role}`)} />}
        </AutoForm>
      }
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default ShipmentPartnersModal;
