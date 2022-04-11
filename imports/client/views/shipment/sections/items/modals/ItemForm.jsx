import React, { useState } from "react";
import PropTypes from "prop-types";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import { Form, Tab, Label } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";

import schema from "./item.schema";
import {
  QuantityInputTypeField,
  ItemGeneralForm,
  ItemReferenceForm,
  ItemConditionsForm,
  ItemWeightForm,
  ItemCostForm,
  ItemCustomsForm,
  ItemNotesForm,
  ItemPlaceHolderPane
} from "./components";

import { ITEM_TYPE_ICONS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const debug = require("debug")("shipment:items");

// fixes issue that if a condition is set the temperature unit enforces the field to be filled
const modelTransform = (mode, model) => {
  if (["submit", "validate"].includes(mode)) {
    if (model.temperature?.range?.unit && !model.temperature?.range?.from) {
      delete model.temperature;
    }
  }

  // Otherwise, return unaltered model.
  return model;
};

export const ItemForm = ({ value, security, onSubmit, taxableOptions, formRef: formRefProp }) => {
  const { t } = useTranslation();
  let formRef;
  const { canEditItems } = security || {};
  const [data, setData] = useState(value || {});
  debug("modal security", security);

  const handleSubmitForm = form => {
    // eslint-disable-next-line no-unused-expressions
    onSubmit && onSubmit(form);
  };

  const handleQuantityChange = quantityv => {
    if (!formRef) {
      return;
    }
    const { amount, code, description, unitDetail } = quantityv;

    const newState = {
      ...data,
      quantity: { amount, code, description }
    };

    newState.type = unitDetail.type;
    newState.itemType = unitDetail.itemType;
    newState.description = description;
    formRef.change("type", newState.type);
    formRef.change("itemType", newState.itemType);
    formRef.change("quantity", newState.quantity);

    // TODO [#269]:fetch the taxable masterdata?
    if (!value && (!newState.calcSettings || !newState.calcSettings.keys)) {
      newState.calcSettings = unitDetail.calcSettings || { keys: {} };
      formRef.change("calcSettings", newState.calcSettings);
    }

    setData(newState);
  };

  const handleChangeTaxable = (taxable, calcSettingsKeys) => {
    const calcSettings = data.calcSettings || {};
    calcSettings.keys = calcSettingsKeys;
    const newState = {
      ...data,
      taxable,
      calcSettings
    };
    formRef.change("taxable", newState.taxable);
    formRef.change("calcSettings.keys", newState.calcSettings.keys);
    setData(newState);
  };

  const panes = [
    {
      menuItem: t("shipment.form.item.tabs.general"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemGeneralForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.references"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemReferenceForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.conditions"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemConditionsForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.weight"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemWeightForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.customs"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemCustomsForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.cost"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemCostForm
              value={data}
              onChangeTaxable={handleChangeTaxable}
              taxableOptions={taxableOptions}
              security={security}
            />
          )}
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.form.item.tabs.notes"),
      render: () => (
        <Tab.Pane>
          {!data.type ? (
            <ItemPlaceHolderPane />
          ) : (
            <ItemNotesForm value={data} security={security} />
          )}
        </Tab.Pane>
      )
    }
  ];

  return (
    <AutoForm
      onChangeModel={model => debug("onChangeModel", model)}
      schema={schema}
      model={value}
      onSubmit={handleSubmitForm}
      modelTransform={modelTransform}
      ref={ref => {
        formRef = ref;
        // eslint-disable-next-line no-param-reassign
        // eslint-disable-next-line no-unused-expressions
        formRefProp && formRefProp(ref);
      }}
    >
      <Form.Group>
        <QuantityInputTypeField
          value={data.quantity}
          disabled={!canEditItems}
          settings={{ disableUnit: !canEditItems }}
          name="quantity"
          onChange={handleQuantityChange}
          placeholder={t("form.quantity")}
        />

        {data.type && (
          <Form.Field>
            <label>
              <Trans i18nKey="shipment.form.item.quantity_unit" />
            </label>
            <Label icon={ITEM_TYPE_ICONS[data.type] || "box"} content={data.type} />{" "}
          </Form.Field>
        )}
      </Form.Group>

      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
      <ErrorsField />
    </AutoForm>
  );
};

ItemForm.propTypes = {
  security: PropTypes.shape({
    canEditItems: PropTypes.bool,
    canEditItemReferences: PropTypes.bool,
    canEditWeights: PropTypes.bool
  }),
  value: PropTypes.object,
  onSubmit: PropTypes.func,
  taxableOptions: PropTypes.array,
  formRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })])
};
