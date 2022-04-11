import { gql, useQuery } from "@apollo/client";
import dot from "dot-object";
import get from "lodash.get";
import React from "react";
import { AutoForm } from "uniforms-semantic";
import { ShipmentImport } from "/imports/api/imports/interfaces/shipmentImport";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";
import {
  DATE_FORMATS,
  DEFAULT_IMPORT_TYPE
} from "/imports/api/_jsonSchemas/enums/shipmentImport";
import { SelectField } from "/imports/client/components/forms/uniforms";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";

export interface Props {
  imp: ShipmentImport;
  onSubmit: (a: any) => void;
}

export interface ModalProps {
  show: boolean;
  showModal: (a: boolean) => void;
  onSubmit: (a: any) => void;
  imp: ShipmentImport;
}

export const GET_IMPORT_TYPES = gql`
  query getAccountSettingsImportTypes {
    settings: getAccountSettings {
      id
      importTypes
    }
  }
`;

const schema = initJSONschema({
  title: "shipmentImportSettings",
  type: "object",
  properties: {
    settings: {
      type: "object",
      properties: {
        dateFormat: { type: "string" }
      },
      required: ["dateFormat"]
    },
    type: { type: "string" }
  },
  required: ["type", "settings"]
});

let formRef;
const ImportSettingsForm = (props: Props) => {
  const { imp, onSubmit } = props;

  const { data = {} } = useQuery(GET_IMPORT_TYPES);
  const importTypes = [
    ...(data.settings?.importTypes || []),
    DEFAULT_IMPORT_TYPE
  ];

  const model = dot.object(
    ["type", "settings.dateFormat", "settings.numberFormat"].reduce(
      (acc, key) => {
        acc[key] = get(imp, key);
        return acc;
      },
      {}
    )
  );

  return (
    <AutoForm
      ref={ref => {
        formRef = ref;
      }}
      schema={schema}
      model={model}
      onSubmit={onSubmit}
    >
      <SelectField
        name="settings.dateFormat"
        label="Date Format"
        allowedValues={DATE_FORMATS}
      />
      <SelectField
        name="type"
        allowedValues={importTypes}
        allowAdditions
        search
      />
    </AutoForm>
  );
};

const SettingsModal = (props: ModalProps) => {
  const { show, showModal, imp, onSubmit } = props;
  return (
    <ModalComponent
      show={show}
      title="Settings"
      showModal={showModal}
      body={<ImportSettingsForm imp={imp} onSubmit={onSubmit} />}
      actions={
        <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
      }
    />
  );
};

export default SettingsModal;
