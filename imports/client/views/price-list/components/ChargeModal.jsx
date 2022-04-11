import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Random } from "/imports/utils/functions/random.js";
import { Form } from "semantic-ui-react";
import { AutoForm, AutoField, LongTextField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ChargeDefinitionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListChargeDefinition.js";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import {
  SelectField,
  CurrencySelectField,
  CostTypeField
} from "/imports/client/components/forms/uniforms";

import { RATE_TYPES, MULTIPLIERS } from "/imports/api/_jsonSchemas/enums/priceList-rate";

const schema = new SimpleSchema2Bridge(ChargeDefinitionSchema);

const debug = require("debug")("price-list:charge");

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (props.index > -1) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`price.list.charge.${l}`} />;
}

let formRef;
export const ChargeForm = ({ charge = {}, onSubmitForm, isLocked }) => {
  const { t } = useTranslation();
  const model = {
    id: Random.id(6),
    ...charge
  };
  return (
    <AutoForm
      schema={schema}
      disabled={isLocked}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSubmitForm}
    >
      <AutoField name="name" label={t("price.list.rate.name")} />
      <Form.Group widths="equal">
        <SelectField
          name="type"
          label={t("price.list.rate.type")}
          options={RATE_TYPES.map(value => ({ value, text: value }))}
        />
        <CostTypeField name="costId" label={t("price.list.rate.cost")} />
      </Form.Group>
      <Form.Group widths={3}>
        <CurrencySelectField
          name="currency"
          label={t("price.list.rate.currency")}
          placeholder={t("price.list.rate.currencySelect")}
        />
        <AutoField name="min" label={t("price.list.rate.min")} />
        <AutoField name="max" label={t("price.list.rate.max")} />
      </Form.Group>
      <SelectField
        name="multiplier"
        options={MULTIPLIERS.map(value => ({ value, text: value }))}
        label={t("price.list.rate.multiplier")}
      />

      <LongTextField
        name="comment"
        label={t("price.list.rate.comment")}
        placeholder={t("price.list.rate.commentAdd")}
      />
      <ErrorsField />
    </AutoForm>
  );

  // {{#if volumeGroup}}
  //   {{! we cannot allow changing this; as this would mess up the existing costs}}
  //   {{#unless charge}}
  //     {{> Dropdown
  //       label=(_ 'price.list.rate.range')
  //       name="volumeRangeIndex"
  //       options=volumeRangeOptions
  //       value=(toString charge.volumeRangeIndex)
  //       disabled=isLocked
  //     }}
  //   {{/unless}}
  // {{/if}}
};

const PriceListChargeModal = ({ ...props }) => {
  const { show, isLocked, index, showModal, charge, charges, onSave } = props;
  const title = generateTitle(props);

  const onSubmitForm = data => {
    debug({ data, index });
    const mod = charges || [];

    if (index > 0) {
      mod[index] = data;
    } else {
      mod.push({
        id: Random.id(),
        ...data
      });
    }
    debug("update: %o", charges);
    onSave({ charges });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<ChargeForm {...{ charge, isLocked, onSubmitForm }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default PriceListChargeModal;
