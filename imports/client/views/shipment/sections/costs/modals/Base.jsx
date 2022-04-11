import React from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

import initializeModal from "/imports/client/components/modals/Modal";
import { ModalActions } from "/imports/client/components/modals/modalActions.jsx";
import CurrencyAmountInput from "/imports/client/components/forms/uniforms/CurrencyAmountInput.jsx";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { EDIT_SHIPMENT_COST } from "../utils/queries";

const debug = require("debug")("shipment:cost:base");

let formRef;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    description: {
      type: String
    },
    amount: Object,
    "amount.value": Number,
    "amount.unit": String
  })
);

const BaseCostForm = ({ onSave }) => {
  const { t } = useTranslation();
  const onSubmitForm = formData => {
    onSave(formData);
  };

  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group>
        <Form.Field width={6}>
          <CurrencyAmountInput name="amount" label={t("shipment.form.cost.value")} />
        </Form.Field>
        <Form.Field width={10}>
          <AutoField name="description" label={t("shipment.form.cost.description")} />
        </Form.Field>
      </Form.Group>
    </AutoForm>
  );
};

const ShipmentBaseCostModal = ({ shipmentId, index, children: trigger }) => {
  const { ModalTrigger, showModal } = initializeModal();
  const [editShipmentCosts, { loading }] = useMutation(EDIT_SHIPMENT_COST);
  const ref = undefined;
  const title = ref ? (
    <Trans i18nKey="shipment.form.baseCost.title.edit" />
  ) : (
    <Trans i18nKey="shipment.form.baseCost.title.add" />
  );

  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ amount, ...cost }) => {
    cost.type = "base";
    cost.source = "input";
    cost.amount = { value: amount.value, currency: amount.unit };

    debug("add base cost %o", { shipmentId, index, cost });
    editShipmentCosts({
      variables: { input: { shipmentId, index, cost } },
      skip: !shipmentId,
      onCompleted(data = {}) {
        showModal(false);
        toast.success("Cost added");
        debug("editShipmentCosts response %o", data);
      },
      onError(error) {
        console.error({ error });
        toast.error("Could not save costs");
      }
    });
  };

  return (
    <ModalTrigger
      title={title}
      body={<BaseCostForm {...{ onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave, showModal, loading }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

export default ShipmentBaseCostModal;
