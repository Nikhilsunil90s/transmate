import React from "react";
import { useTranslation } from "react-i18next";
import { AutoForm, RadioField } from "uniforms-semantic";
import { Message } from "semantic-ui-react";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";

const REMOVE_PROJECT_SHIPMENT_ACTIONS = ["UNLINK", "REMOVE"];
const schema = initJSONschema({
  title: "removeProjectShipmentAction",
  type: "object",
  properties: {
    linkedShipmentAction: {
      type: "string",
      enum: REMOVE_PROJECT_SHIPMENT_ACTIONS,
      default: REMOVE_PROJECT_SHIPMENT_ACTIONS[0],
      uniforms: { checkboxes: true }
    }
  },
  required: ["linkedShipmentAction"]
});

let formRef;
const RemoveProjectModal = ({ show, showModal, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("projects.remove.title")}
      body={
        <>
          <Message
            negative
            icon="exclamation"
            content={t("projects.remove.message")}
          />
          <AutoForm
            schema={schema}
            model={{ linkedShipmentAction: REMOVE_PROJECT_SHIPMENT_ACTIONS[0] }}
            ref={ref => {
              formRef = ref;
            }}
            onSubmit={onConfirm}
          >
            <RadioField
              name="linkedShipmentAction"
              label={t("projects.remove.label")}
              transform={action => t(`projects.remove.actions.${action}`)}
            />
          </AutoForm>
        </>
      }
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

export default RemoveProjectModal;
