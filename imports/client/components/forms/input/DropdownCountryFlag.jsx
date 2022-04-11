import React from "react";
import { connectField } from "uniforms";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { Address } from "/imports/api/addresses/Address.js";

const currencyList = Address.countryCodes().map(({ name, code }) => ({
  key: code,
  value: code,
  text: name,
  flag: code.toLowerCase()
}));

export const DropdownCountryFlag = ({
  disabled,
  id,
  inputRef,
  loading,
  label,
  onChange,
  placeholder,
  required,
  error,
  value,
  className
}) => {
  return (
    <div className={classNames("field", className, { required, error })}>
      {label && <label>{label}</label>}

      <Dropdown
        id={id}
        disabled={disabled}
        ref={inputRef}
        required={required}
        loading={loading}
        fluid
        search
        selection
        label={label}
        value={value}
        options={currencyList}
        placeholder={placeholder}
        onChange={(_, { value: changedValue }) => {
          // add catch if onchange is not given in params
          if (typeof onChange === "function") onChange(changedValue);
        }}
      />
    </div>
  );
};

export default connectField(DropdownCountryFlag);
