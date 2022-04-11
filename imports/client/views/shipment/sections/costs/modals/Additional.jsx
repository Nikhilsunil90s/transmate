import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

import initializeModal from "/imports/client/components/modals/Modal";
import { ModalActions } from "/imports/client/components/modals/modalActions.jsx";
import PartnerSelectField from "/imports/client/components/forms/uniforms/PartnerSelect.jsx";
import CurrencyAmountInput from "/imports/client/components/forms/uniforms/CurrencyAmountInput.jsx";
import CostTypeSelect from "/imports/client/components/forms/uniforms/CostTypeSelect.jsx";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { EDIT_SHIPMENT_COST } from "../utils/queries";

const debug = require("debug")("shipment:costs:additional");

/** can add, edit and remove an additional cost
 * index == index in cost array
 */
// TODO [#257]: modalactions with delete + handler

let formRef;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    description: {
      type: String,
      optional: true
    },
    amount: Object,
    "amount.value": Number,
    "amount.unit": String,
    costId: { type: String },
    sellerId: { optional: true, type: String }
  })
);

const AdditionalCostForm = ({ onSave }) => {
  const { t } = useTranslation();

  const [advancedVisible, showAdvanced] = useState(false);

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
      <AutoField name="description" label={t("shipment.form.cost.description")} />
      <Form.Group>
        <Form.Field width={6}>
          <CurrencyAmountInput name="amount" />
        </Form.Field>
        <Form.Field width={10}>
          <CostTypeSelect name="costId" label={t("shipment.form.cost.cost")} />
        </Form.Field>
      </Form.Group>

      <a style={{ cursor: "pointer" }} onClick={() => showAdvanced(!advancedVisible)}>
        <Trans i18nKey="form.advanced" />
      </a>
      <br />
      <div style={advancedVisible ? {} : { visibility: "hidden" }}>
        <PartnerSelectField
          name="sellerId"
          fluid
          options={{ partnerTypes: ["carrier", "provider"] }}
          placeholder={t("tender.partner.select")}
        />
      </div>
    </AutoForm>
  );
};

const ShipmentAdditionalCostModal = ({ shipmentId, index, children: trigger }) => {
  const { ModalTrigger, showModal } = initializeModal();
  const [editShipmentCosts, { loading }] = useMutation(EDIT_SHIPMENT_COST);
  const title =
    index >= 0 ? (
      <Trans i18nKey="shipment.form.cost.title.edit" />
    ) : (
      <Trans i18nKey="shipment.form.cost.title.add" />
    );

  const onSave = () => {
    formRef.submit();
  };
  const onSubmitForm = ({ amount, ...cost }) => {
    cost.type = "additional";
    cost.source = "input";
    cost.amount = { value: amount.value, currency: amount.unit };

    debug("add additional cost %o", { shipmentId, index, cost });
    editShipmentCosts({
      variables: { input: { shipmentId, index, cost } },
      skip: !shipmentId
    })
      .then((data = {}) => {
        showModal(false);
        toast.success("Cost added");
        debug("editShipmentCosts response %o", data);
      })
      .catch(error => {
        console.error({ error });
        toast.error("Could not save costs");
      });
  };

  return (
    <ModalTrigger
      title={title}
      body={<AdditionalCostForm {...{ onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave, showModal, loading }} />} // modalSubmitBtn created
    >
      {trigger}
    </ModalTrigger>
  );
};

export default ShipmentAdditionalCostModal;
