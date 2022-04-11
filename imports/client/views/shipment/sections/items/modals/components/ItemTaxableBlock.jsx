import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Form, Select, Input, Button, Grid } from "semantic-ui-react";

/**
 * @param {String[]} options array of unit_keys (pal, kg, etc)
 */
export const ItemTaxableBlock = ({ value, options = [], onChange, security }) => {
  const { t } = useTranslation();
  const disabled = !security.canEditItems;
  const { taxable, calcSettingsKeys } = value;
  let taxableData = taxable;
  if (!taxableData || !(taxableData.length > 0)) {
    // pre-populate from master data
    taxableData = Object.keys(calcSettingsKeys).map(name => {
      return { type: name, quantity: calcSettingsKeys[name] };
    });
  }
  const [taxableState, setTaxableState] = useState(taxableData);

  const selectOpts = options.map(name => {
    return {
      key: name,
      value: name,
      text: name
    };
  });
  const [selectType, setSelectType] = useState(selectOpts[0].value);
  const initDisableAdd = !!taxableState.find(({ type: tt }) => tt === selectType);

  const [disabledAdd, setDisabledAdd] = useState(!!initDisableAdd);

  const checkAddDisabled = type => {
    // eslint-disable-next-line no-param-reassign
    type = type || selectType;
    const item = taxableState.find(({ type: tt }) => tt === type);

    // :only enable add when not exists the same key
    if (!item) {
      setDisabledAdd(false);
      return;
    }
    setDisabledAdd(true);
  };

  const triggerChange = () => {
    taxableState.reduce((acc, { type, quantity }) => {
      acc[type] = quantity;
      return acc;
    }, {});

    // TODO [#270]:will here need update? need consider the added item
    // eslint-disable-next-line no-unused-expressions
    onChange && onChange(taxableState, calcSettingsKeys);
  };

  const handleAdd = e => {
    e.preventDefault();

    // add have not factor conversion
    taxableState.push({
      type: selectType,
      quantity: 0
    });
    setTaxableState(taxableState);
    checkAddDisabled(selectType);
    triggerChange();
  };

  const handleInput = (data, type) => {
    const item = taxableState.find(({ type: tt }) => tt === type);
    item.quantity = data.value;
    const editingKeyItemFactor = calcSettingsKeys[type];
    if (editingKeyItemFactor) {
      // need apply factor
      taxableState.map(it => {
        // skip current editing item
        if (it === item) {
          return it;
        }

        // apply factor
        const currentFactor = calcSettingsKeys[it.type];
        if (!currentFactor) {
          return it;
        }
        it.quantity = (currentFactor / editingKeyItemFactor) * item.quantity;
        return it;
      });
    }

    setTaxableState(taxableState);
    checkAddDisabled(selectType);
    triggerChange();
  };

  const handleSelect = (e, data) => {
    const type = data.value;
    setSelectType(type);
    checkAddDisabled(type);
  };

  return (
    <>
      <Form.Group widths="equal">
        {taxableState.map(({ type, quantity }, i) => {
          return (
            <Form.Field key={i}>
              <Input
                disabled={disabled}
                onChange={(e, data) => {
                  handleInput(data, type);
                }}
                label={type}
                type="number"
                value={quantity || ""}
              />
            </Form.Field>
          );
        })}
      </Form.Group>

      {!disabled && (
        <Grid columns={2}>
          <Grid.Column>
            <Select
              placeholder={t("form.select")}
              value={selectType}
              onChange={handleSelect}
              options={selectOpts}
            />
          </Grid.Column>
          <Grid.Column>
            <Button disabled={disabledAdd} onClick={handleAdd}>
              <Trans i18nKey="form.add" />
            </Button>
          </Grid.Column>
        </Grid>
      )}
    </>
  );
};
