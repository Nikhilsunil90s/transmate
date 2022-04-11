import React from "react";
import PropTypes from "prop-types";
import { ModalComponent, ModalActionsClose, ModalActions } from "/imports/client/components/modals";
import { AutoField, AutoForm } from "uniforms-semantic";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { CurrencyAmountField } from "/imports/client/components/forms/uniforms";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    description: {
      type: String,
      optional: true
    },
    amount: Object,
    "amount.value": Number,
    "amount.unit": String
  })
);

let formRef;
const BillingItemForm = ({ billingItem, onSubmitForm }) => {
  const { t } = useTranslation();

  return (
    <AutoForm
      schema={schema}
      model={billingItem}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSubmitForm}
    >
      <AutoField name="description" label={t("shipment.form.cost.description")} />

      <CurrencyAmountField name="amount" />
    </AutoForm>
  );
};

const BillingItemModal = props => {
  const { show, showModal, isLocked, billingItem } = props;
  const isSaving = false;
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title="Billing Item"
      body={<BillingItemForm billingItem={billingItem} />}
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && (
            <ModalActions {...{ showModal, disabled: isSaving, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

BillingItemModal.propTypes = {
  show: PropTypes.bool,
  isLocked: PropTypes.bool,
  showModal: PropTypes.func.isRequired
};

export default BillingItemModal;
