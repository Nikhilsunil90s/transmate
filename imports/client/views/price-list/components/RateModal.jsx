import React, { useState } from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { Trans, useTranslation } from "react-i18next";
import { Form, Tab, Icon, Dropdown, Input, Button } from "semantic-ui-react";
import { useField } from "uniforms";
import { AutoForm, AutoField, LongTextField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { ruleOptionBuilder } from "/imports/utils/priceList/fnPriceListHelpers.js";
import { ModalComponent, ModalActions, ModalActionsClose } from "/imports/client/components/modals";
import {
  SelectField,
  CostTypeField,
  CurrencyAmountField
} from "/imports/client/components/forms/uniforms";

import { RATE_TYPES, MULTIPLIERS } from "/imports/api/_jsonSchemas/enums/priceList-rate";
import { PriceListRateRulesSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListRateRuleDefinition";
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate.js";

const debug = require("debug")("price-list:rate");

const schema = new SimpleSchema2Bridge(PriceListRateSchema);
const ruleTypes = PriceListRateRulesSchema.objectKeys().map(value => ({ value, text: value }));

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (!!props.rate) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`price.list.rate.${l}`} />;
}

const RulesListField = ({ name, ruleOptions, isLocked, ...props }) => {
  const [fieldProps] = useField(name, props);

  // from rules array to manageable array:
  const rulesConverted = (fieldProps.value || []).map(rule => {
    const type = Object.keys(rule)[0];
    return {
      type,
      value: rule[type],
      options: get(ruleOptions, [type])
    };
  });

  const [rulesArr, setRules] = useState(rulesConverted);
  const selectedRuleTypes = rulesArr.map(({ type }) => type);

  const updateFormState = () => {
    const rules = rulesArr.map(({ type, value }) => ({ [type]: value }));
    fieldProps.onChange(rules);
  };

  const modifyRule = ({ key, value, index }) => {
    const mod = rulesArr || [];
    mod[index][key] = value;
    const { type } = mod[index] || {};
    mod[index].options = type ? ruleOptions[type] : [];
    setRules([...mod]);
    updateFormState();
  };

  const removeRule = ({ index }) => {
    const mod = rulesArr || [];
    mod.splice(index);
    setRules(mod);
    updateFormState();
  };

  const addRule = () => {
    const mod = rulesArr;
    const filteredRuleTypes = ruleTypes.filter(o => !selectedRuleTypes.includes(o.type));
    mod.push({ type: filteredRuleTypes[0], value: undefined });
    setRules(mod);
    updateFormState();
  };

  return (
    <>
      <div className="fields">
        <div className="eight wide field required">
          <label>
            <Trans i18nKey="price.list.rate.rule.type" />
          </label>
        </div>
        <div className="six wide field required">
          <label>
            <Trans i18nKey="price.list.rate.rule.value" />
          </label>
        </div>
      </div>
      {rulesArr.map(({ type, value: ruleValue, options }, index) => {
        const filteredRuleTypes = ruleTypes.filter(
          o => o.type === type || !selectedRuleTypes.includes(o.type)
        );
        return (
          <Form.Group key={`rule-${index}`}>
            {/* left: show key */}
            <Form.Field
              width={8}
              content={
                <Dropdown
                  selection
                  value={type}
                  options={filteredRuleTypes}
                  disabled={isLocked}
                  onChange={(_, { value }) => modifyRule({ index, value, key: "type" })}
                />
              }
            />
            {/* right: show value either dropdown or input */}
            <Form.Field
              width={6}
              content={
                !!options ? (
                  <Dropdown
                    selection
                    options={options || []}
                    disabled={isLocked}
                    value={ruleValue}
                    onChange={(_, { value }) => modifyRule({ index, value, key: "value" })}
                  />
                ) : (
                  <Input
                    value={ruleValue}
                    disabled={isLocked}
                    onChange={(_, { value }) => modifyRule({ index, value, key: "value" })}
                  />
                )
              }
            />
            <Form.Field
              width={2}
              content={!isLocked && <Icon name="trash alternate" style={{ cursor: "pointer" }} />}
              onClick={() => removeRule({ index })}
            />
          </Form.Group>
        );
      })}
      <Button basic content={<Trans i18nKey="price.list.rate.rule.add" />} onClick={addRule} />
    </>
  );
};

let formRef;
export const RateForm = ({ ...props }) => {
  const { t } = useTranslation();
  const { rate, isLocked, onSubmitForm, priceList } = props;
  const ruleOptions = priceList ? ruleOptionBuilder(priceList, t) : undefined;

  const panes = [
    {
      menuItem: t("price.list.rate.details"),
      render: () => (
        <Tab.Pane>
          <Form.Group widths={2}>
            <SelectField
              name="type"
              option={RATE_TYPES.map(value => ({ value, text: value }))}
              label={t("price.list.rate.type")}
            />
            <CostTypeField name="costId" label={t("price.list.rate.cost")} />
          </Form.Group>
          <Form.Group widths={3}>
            <CurrencyAmountField name="amount" options={{ additionalOptions: ["%"] }} />
            <SelectField
              name="multiplier"
              options={MULTIPLIERS.map(value => ({ value, text: value }))}
              label={t("price.list.rate.multiplier")}
            />
          </Form.Group>
          <Form.Group widths={3}>
            <AutoField name="min" label={t("price.list.rate.min")} />
            <AutoField name="max" label={t("price.list.rate.max")} />
          </Form.Group>
        </Tab.Pane>
      )
    },
    {
      menuItem: t("price.list.rate.comment"),
      render: () => (
        <Tab.Pane>
          <LongTextField name="comment" />
        </Tab.Pane>
      )
    },
    {
      menuItem: t("price.list.rate.rules"),
      render: () => (
        <Tab.Pane>
          <RulesListField name="rules" ruleOptions={ruleOptions} isLocked={isLocked} />
        </Tab.Pane>
      )
    },
    {
      menuItem: t("price.list.rate.calculation"),
      render: () => (
        <Tab.Pane>
          <LongTextField name="calculation.formula" />
        </Tab.Pane>
      )
    }
  ];

  return (
    <AutoForm
      schema={schema}
      disabled={isLocked}
      model={rate}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSubmitForm}
    >
      <AutoField name="name" label={t("price.list.rate.name")} />
      <Tab menu={{ secondary: true, pointing: true, size: "small" }} panes={panes} />
      <ErrorsField />
    </AutoForm>
  );

  // {{#if gt countEditing 1}}
  // <div class="ui warning message">
  // 	<i class="icon exclamation"></i>
  // 	You are editing {{countEditing}} rates!
  // </div>
  // {{/if}}
  // {{#if isLocked}}
  // {{> ModalActionsClose}}
  // {{else}}
  // {{#if rate}}
  // {{> ModalActionsDelete}}
  // {{else}}
  // {{> ModalActions}}
  // {{/if}}
  // {{/if}}
  // {{/Modal}}
};

const PriceListRateModal = ({ ...props }) => {
  const { show, isLocked, showModal, rate, onSave, countEditing, priceList, priceListId } = props;
  const title = generateTitle(props);

  const onSubmitForm = formData => {
    const update = { ...formData, priceListId };
    const selector = rate.id ? { id: rate.id } : {};

    // parsing the rules:
    // not if count > 1!
    if (countEditing > 1) {
      delete update.rules;
    }

    // called from grid (editing one or more items in the grid) or from list > rate
    // onSave is passed on from parent so we have correct handling
    const callback = () => showModal(false);
    debug("selector: %o, update: %O", selector, update);
    onSave({ update, selector }, callback);
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<RateForm {...{ rate, priceList, isLocked, onSubmitForm }} />}
      actions={
        isLocked ? (
          <ModalActionsClose showModal={showModal} />
        ) : (
          <ModalActions {...{ showModal, onSave: () => formRef.submit() }} />
        )
      }
    />
  );
};

PriceListRateModal.propTypes = {
  countEditing: PropTypes.number,
  onSave: PropTypes.func,
  rate: PropTypes.object,
  priceListId: PropTypes.string,
  priceList: PropTypes.object,
  show: PropTypes.bool,
  showModal: PropTypes.func,
  isLocked: PropTypes.bool
};
export default PriceListRateModal;
