import React from "react";
import { useTranslation } from "react-i18next";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { QueryType } from "/imports/client/components/forms/uniforms/SelectPriceListField";
import { SelectPriceListField } from "/imports/client/components/forms/uniforms";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({ priceListId: String })
);

interface Props {
  show: boolean;
  showModal: (show: boolean) => void;
  onSave: (model: { priceListId: string }) => void;
  query: QueryType;
}

let formRef;
const Form = ({ onSave, query }) => {
  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSave}
    >
      {/* @ts-ignore FIXME TS*/}
      <SelectPriceListField name="priceListId" query={query} />
      <ErrorsField />
    </AutoForm>
  );
};

const SelectPriceListModal = ({ show, showModal, onSave, query }: Props) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("modal.priceListSelect.title")}
      body={<Form onSave={onSave} query={query} />}
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

export default SelectPriceListModal;
