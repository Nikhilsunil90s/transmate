import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

export const SelectFieldWithAdditions = ({
  className,
  allowedValues,
  disabled,
  id,
  inputRef,
  label,
  search,
  onChange,
  placeholder,
  required,
  error,
  multiple,
  options: baseOptions, // [ {key, text, value}]
  transform,
  value = [],
  loading
}) => {
  const optionList =
    baseOptions ||
    (allowedValues || []).map(allowedValue => {
      const isString = typeof allowedValue === "string";
      if (isString && !transform) {
        return { value: allowedValue, text: allowedValue };
      }

      return { value: allowedValue, text: transform ? transform(allowedValue) : allowedValue };
    });

  const [dataInput, setDataInput] = useState(value);
  const [options, setOptions] = useState(baseOptions);

  const onSelectItem = (newValue = []) => {
    setDataInput(newValue);
    onChange(newValue);
  };

  const handleAddition = (e, { value: newVal }) => {
    setDataInput([...dataInput, newVal]);
    setOptions([...options, { key: newVal, value: newVal, text: newVal }]);
  };

  return (
    <div className={classNames("field", className, { required, error })}>
      <label htmlFor={id}>{label}</label>

      <Dropdown
        id={id}
        disabled={disabled}
        loading={loading}
        ref={inputRef}
        required={required}
        multiple={multiple}
        fluid
        search={search}
        selection
        value={value}
        options={optionList}
        label={label}
        placeholder={placeholder}
        onChange={(_, { value: changedValue }) => {
          onSelectItem(changedValue);
        }}
        onAddItem={handleAddition}
      />
    </div>
  );
};

export default connectField(SelectFieldWithAdditions);
