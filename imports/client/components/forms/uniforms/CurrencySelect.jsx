import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

import currencies from "iso-currencies";

const shortList = ["EUR", "USD", "GBP", "CNY"];

const currencyList = Object.entries(currencies.list()).map(([key, { symbol }]) => ({
  key,
  value: key,
  text: key,
  content: (
    <>
      {key}
      <span style={{ opacity: 0.3 }}>({symbol})</span>
    </>
  )
}));
export const currencyOptions = [
  ...currencyList.filter(({ key }) => shortList.includes(key)),
  { key: "divider", content: <div className="ui divider" /> },
  ...currencyList.filter(({ key }) => !shortList.includes(key))
];

export const CurrencyDropdown = ({
  asLabel,
  disabled,
  id,
  inputRef,
  onChange,
  placeholder,
  required,
  value = "EUR",
  additionalOptions = []
}) => {
  const dropdownOptions = asLabel
    ? { disabled, search: true }
    : {
        id,
        ref: inputRef,
        disabled,
        required,
        selection: true,
        fluid: false,
        search: true,
        placeholder
      };

  return (
    <Dropdown
      {...dropdownOptions}
      onChange={(_, { value: changedValue }) => {
        onChange(changedValue);
      }}
      value={value}
      options={[...additionalOptions.map(v => ({ text: v, value: v })), ...currencyOptions]}
    />
  );
};

const CurrencySelect = ({ ...props }) => {
  const { required, error, id, label, className } = props;
  return (
    <div className={classNames("field", className, { required, error })}>
      <label htmlFor={id}>{label}</label>
      <CurrencyDropdown {...props} />
    </div>
  );
};

CurrencySelect.propTypes = {
  required: PropTypes.bool,
  error: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.string
};

export default connectField(CurrencySelect);
