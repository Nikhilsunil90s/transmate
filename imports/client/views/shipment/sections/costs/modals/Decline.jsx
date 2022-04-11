/* eslint-disable no-use-before-define */
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, LongTextField } from "uniforms-semantic";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";

import initializeModal from "/imports/client/components/modals/Modal";
import { ModalActions } from "/imports/client/components/modals/modalActions.jsx";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { costFixtures } from "../../../../../../api/_jsonSchemas/simple-schemas/_utilities/shipment-cost";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

let formRef;
const ShipmentDeclineCostModal = ({ onSave, children: trigger }) => {
  const { ModalTrigger, showModal } = initializeModal();

  const onSaveForm = () => {
    formRef.submit();
  };
  const onSubmitForm = response => {
    const cb = () => {
      // refresh();
      showModal(false);
    };
    onSave({ response }, cb);
  };

  return (
    <ModalTrigger
      title={<Trans i18nKey="shipment.costs.decline.title" />}
      body={<DeclineCostForm {...{ onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ onSave: onSaveForm, showModal }} />}
    >
      {trigger}
    </ModalTrigger>
  );
};

const DeclineCostForm = ({ onSave }) => {
  const { t } = useTranslation();

  const onSubmitForm = model => {
    onSave(model);
  };

  const reasonOptions = flow(
    map(item => ({
      key: item,
      value: item,
      text: <Trans i18nKey={`shipment.costs.decline.codes.${item}`} />
    })),
    sortBy(el => el.text)
  )(costFixtures.costDeclineReasons);

  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <SelectField
        name="reason"
        option={reasonOptions}
        placeHolder={t("shipment.form.costs.serviceLevel.placeholder")}
        label={t("shipment.costs.decline.reason")}
      />
      <LongTextField
        name="comment"
        label={`${t("shipment.costs.decline.comment")} ${t("form.optional")}`}
      />
    </AutoForm>
  );
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    reason: {
      type: String,
      allowedValues: costFixtures.costDeclineReasons
    },
    comment: {
      type: String,
      optional: true
    }
  })
);

export default ShipmentDeclineCostModal;
