import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Input, Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { useQuery, gql } from "@apollo/client";

import { ITEM_TYPE_ICONS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const debug = require("debug")("shipment:items");

export const GET_ITEM_TYPES = gql`
  query getSettingsItemTypesForUnitDropdown($includeBaseUOMS: Boolean) {
    itemUnits: getSettingsItemTypes(includeBaseUOMS: $includeBaseUOMS) {
      type
      name
      description
      code
      unitType
      taxKeys
    }
  }
`;

const QuantityDropdownGroup = ({ onChange, opts, group }) => {
  const groupOptions = opts.filter(({ type }) => type === group);
  if (!groupOptions.length) return null;
  return (
    <>
      <Dropdown.Divider />
      <Dropdown.Header
        icon={ITEM_TYPE_ICONS[group]}
        content={<Trans i18nKey={`shipment.form.item.quantityType.${group}`} />}
      />
      <Dropdown.Menu scrolling>
        {groupOptions.map((option, i) => (
          <Dropdown.Item
            key={i}
            {...{ value: option.code, text: option.description }}
            onClick={onChange}
          />
        ))}
      </Dropdown.Menu>
    </>
  );
};

const QuantityDropdown = ({
  disabled,
  id,
  inputRef,
  error,
  options,
  onChange,
  value = "",
  selection,
  includeBaseUOMS
}) => {
  const { t } = useTranslation();
  const [opts, setOpts] = useState(options);
  const [state, setState] = useState(value);

  const handleSearch = e => {
    const searchQuery = e.target.value.toLowerCase();
    if (searchQuery === "") {
      setOpts(options);
    } else {
      const filteredOptions = opts.filter(
        o =>
          o.name?.toLowerCase().includes(searchQuery) || o.code.toLowerCase().includes(searchQuery)
      );
      setOpts(filteredOptions);
    }
  };
  const handleSelection = (e, { value: selectedValue }) => {
    const selectedOption = options.find(({ code }) => code === selectedValue);
    onChange(selectedOption);
    setState(selectedOption.code);
    debug("selectedValue %o", selectedOption);
  };

  return (
    <Dropdown
      id={id}
      disabled={disabled}
      className={classNames({ selection })}
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
        {/* all options grouped */}
        <QuantityDropdownGroup group="TU" opts={opts} onChange={handleSelection} />
        <QuantityDropdownGroup group="HU" opts={opts} onChange={handleSelection} />

        {/* optional basUOM group */}
        {includeBaseUOMS && (
          <QuantityDropdownGroup group="UOM" opts={opts} onChange={handleSelection} />
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const QuantityInputDropdown = QuantityDropdown;
export const QuantityUnitSelectionWithLoader = ({ ...props }) => {
  const { includeBaseUOMS } = props;

  // :fetch items by gql
  const { data, loading, error } = useQuery(GET_ITEM_TYPES, {
    variables: { includeBaseUOMS },
    fetchPolicy: "no-cache"
  });

  if (error) {
    console.error("error itemUnits", error);
  }
  const options = data?.itemUnits || [];

  debug("quantity type options", options);
  if (loading) return <Dropdown loading />;
  return <QuantityDropdown {...props} options={options} />;
};

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
  options
}) => {
  const untiedValue = { ...value };
  const [stateValue, setStateValue] = useState(untiedValue);

  const handleAmount = (e, { value: newAmount }) => {
    const selectedUnit =
      options.find(({ code: c }) => {
        return c === stateValue.code;
      }) || {};
    setStateValue(pre => {
      const newState = {
        ...pre,
        amount: parseFloat(newAmount) || 1,
        code: selectedUnit.code,
        description: selectedUnit.description,
        unitDetail: selectedUnit
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
        code: selectedUnit.code,
        description: selectedUnit.description,
        unitDetail: selectedUnit
      };
      onChange(newState);

      // do something with all the other info

      return newState;
    });
  };

  /* eslint-disable-next-line new-cap */
  const qtyDropdown = QuantityDropdown({
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

const QuantityInputLoader = ({ ...props }) => {
  // :fetch items by gql
  const { data, loading, error } = useQuery(GET_ITEM_TYPES, {
    fetchPolicy: "no-cache"
  });

  if (error) {
    console.error("error itemUnits", error);
  }
  const options = data?.itemUnits || [];
  debug("quantity type options", options);

  return loading ? (
    <Input label={<Dropdown loading disabled />} labelPosition="right" disabled />
  ) : (
    <QuantityInput {...props} {...{ options }} />
  );
};

export default connectField(QuantityInputLoader);

// export default QuantityInput;
