/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { useQuery, gql } from "@apollo/client";
import get from "lodash.get";

import { DEFAULT_UNITS, ITEM_TYPE_ICONS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const debug = require("debug")("shipment:items");

/** @returns {{amount: Number, code: String}} */

//#region components
export const GET_SETTINGS_DATA = gql`
  query getAccountSettingsGoodsFilterField {
    accountSettings: getAccountSettings {
      id
      itemUnits {
        type
        name
        description
        code
        unitType
        taxKeys
      }
    }
  }
`;

const quantityDropdown = ({ disabled, id, inputRef, error, options, onChange, value = "" }) => {
  const { t } = useTranslation();
  const [opts, setOpts] = useState(options);
  const [state, setState] = useState(value);
  const handlingUnits = opts.filter(({ type }) => type === "HU");

  const handleSearch = e => {
    const searchQuery = e.target.value.toLowerCase();
    if (searchQuery === "") {
      setOpts(options);
    } else {
      const filteredOptions = opts.filter(
        o =>
          o.name.toLowerCase().includes(searchQuery) || o.code.toLowerCase().includes(searchQuery)
      );
      setOpts(filteredOptions);
    }
  };
  const handleSelection = (e, { value: code }) => {
    onChange({ code });
    setState(code);
    debug("selectedValue %o", code);
  };

  return (
    <Dropdown
      id={id}
      disabled={disabled}
      error={error}
      ref={inputRef}
      value={state}
      placeholder={t("shipment.form.item.quantity")}
      text={value}
    >
      <Dropdown.Menu>
        <Input
          icon="search"
          iconPosition="left"
          className="search"
          onClick={e => e.stopPropagation()} // prevents the dropdown from closing when clicking input
          onChange={handleSearch}
        />
        <Dropdown.Divider />
        <Dropdown.Header
          icon={ITEM_TYPE_ICONS.HU}
          content={t("shipment.form.item.quantityType.HU")}
        />
        <Dropdown.Menu scrolling>
          {handlingUnits.map((option, i) => (
            <Dropdown.Item
              key={i}
              {...{ value: option.code, text: option.description }}
              onClick={handleSelection}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const QuantityInputDropdown = quantityDropdown;

const QuantityInput = ({
  disabled,
  id,
  inputRef,
  label,
  onChange,
  placeholder,
  required,
  error,
  value = {}, // {amount, code}
  settings = {}, // disableUnit
  options = DEFAULT_UNITS
}) => {
  const untiedValue = { ...value };
  const [stateValue, setStateValue] = useState(untiedValue);

  const handleAmount = (e, { value: newAmount }) => {
    setStateValue(pre => {
      const newState = {
        ...pre,
        amount: parseFloat(newAmount) || 1,
        code: stateValue.code
      };
      onChange(newState);
      return newState;
    });
  };

  const handleUnit = selectedUnit => {
    setStateValue(pre => {
      const newState = {
        ...pre,
        amount: parseFloat(stateValue.amount) || 1,
        code: selectedUnit.code
      };
      onChange(newState);

      // do something with all the other info

      return newState;
    });
  };

  const qtyDropdown = quantityDropdown({
    value: stateValue.code,
    disabled: settings.disableUnit,
    options,
    onChange: handleUnit
  });

  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>

      <Input
        id={id}
        disabled={disabled}
        ref={inputRef}
        value={stateValue.amount || ""}
        type="number"
        label={qtyDropdown}
        labelPosition="right"
        placeholder={placeholder}
        onChange={handleAmount}
      />
    </div>
  );
};

//#endregion

const QuantityInputLoader = ({ ...props }) => {
  // :fetch items by gql
  const { data, loading, error } = useQuery(GET_SETTINGS_DATA, {
    fetchPolicy: "no-cache"
  });

  if (error) {
    console.error("error itemUnits", error);
  }
  const optionsRaw = get(data, ["accountSettings", "itemUnits"]);
  const options = !!optionsRaw ? optionsRaw : undefined;

  debug("quantity type options", options);

  return loading ? (
    <Input label={<Dropdown loading disabled />} labelPosition="right" disabled />
  ) : (
    <QuantityInput {...props} {...{ options }} />
  );
};

export default connectField(QuantityInputLoader);
