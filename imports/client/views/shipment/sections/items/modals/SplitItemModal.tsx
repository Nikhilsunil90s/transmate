import React from "react";
import { Trans } from "react-i18next";
import { Message } from "semantic-ui-react";
import { AutoField, AutoForm, ErrorsField } from "uniforms-semantic";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";

const schema = initJSONschema({
  title: "splitShipmentItemSchema",
  type: "object",
  properties: {
    amount: { type: "number" }
  },
  required: ["amount"]
});

let formRef;
const SplitItemForm = ({ onSave, initialAmount }) => {
  return (
    <AutoForm
      schema={schema}
      model={{ amount: initialAmount }}
      onSubmit={onSave}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Message
        content={
          <Trans
            i18nKey="shipment.form.item.splitInfo"
            values={{ maxAmount: initialAmount }}
          />
        }
      />
      <AutoField name="amount" />
      <ErrorsField />
    </AutoForm>
  );
};

type Props = {
  showModal: (a: boolean) => void;
  show: boolean;
  onSave: (a: { amount: number }) => void;
  initialAmount: number;
};

const SplitItemModal = ({ showModal, show, onSave, initialAmount }: Props) => {
  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="shipment.form.item.split" />}
      showModal={showModal}
      body={<SplitItemForm onSave={onSave} initialAmount={initialAmount} />}
      actions={
        <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
      }
      trigger={undefined}
      scrolling={undefined}
    />
  );
};

export default SplitItemModal;
