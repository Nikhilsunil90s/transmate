import React, { useState } from "react";
import capitalize from "lodash.capitalize";
import { Trans, useTranslation } from "react-i18next";
import { Random } from "/imports/utils/functions/random.js";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import {
  ModalActionsClose,
  ModalActions,
  ModalActionsDelete,
  ModalComponent
} from "/imports/client/components/modals";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField, LongTextField } from "uniforms-semantic";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import TagField from "/imports/client/components/forms/uniforms/TagField.jsx";

import { RESPONSE_TYPES, REQUIREMENT_TYPES } from "/imports/api/_jsonSchemas/enums/tender";
import { TenderRequirementSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender.js";

//#region components
const schema = new SimpleSchema2Bridge(TenderRequirementSchema);

let formRef;
const RequirementForm = ({ data, isLocked, onSubmit }) => {
  const { t } = useTranslation();
  const [viewField, setViewField] = useState(false);
  return (
    <AutoForm
      model={data}
      disabled={isLocked}
      onSubmit={onSubmit}
      schema={schema}
      modelTransform={(mode, model) => {
        if (["validate", "submit"].includes(mode)) {
          return {
            ...model,
            id: model.id || Random.id(6)
          };
        }
        return model;
      }}
      onChange={(key, value) => {
        if (key === "responseType") {
          if (value === "list") {
            setViewField(true);
          } else {
            setViewField(false);
          }
        }
      }}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoField name="title" label={t("tender.requirement.title")} />
      <LongTextField name="details" placeholder={t("tender.requirement.details")} />
      <Form.Group widths="equal">
        <SelectField
          name="type"
          label={t("tender.requirement.type")}
          options={REQUIREMENT_TYPES.map(type => ({
            key: type,
            value: type,
            text: capitalize(type)
          }))}
        />
        <SelectField
          name="responseType"
          label="Response"
          options={RESPONSE_TYPES.map(key => ({
            key,
            value: key,
            text: <Trans i18nKey={`tender.requirement.responseTypes.${key}`} />
          }))}
        />
      </Form.Group>

      {viewField && <TagField name="responseOptions" />}
    </AutoForm>
  );
};

//#endregion

const TenderRequirementModal = ({ ...props }) => {
  const { show, index, isLocked, requirement, showModal, onSave, onDelete } = props;

  const title =
    index > -1 ? (
      <Trans i18nKey="tender.requirement.update" />
    ) : (
      <Trans i18nKey="tender.requirement.add" />
    );
  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={
        <RequirementForm
          {...{
            isLocked,
            data: requirement,
            onSubmit: data => onSave(data)
          }}
        />
      }
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!requirement && (
            <ModalActionsDelete
              {...{ showModal, onSave: () => formRef.submit(), onDelete: () => onDelete(index) }}
            />
          )}
          {!isLocked && !requirement && (
            <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

export default TenderRequirementModal;
