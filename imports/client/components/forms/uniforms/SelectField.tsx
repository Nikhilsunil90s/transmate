import React, { useState, useEffect } from "react";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

type dropdownValue = string | number | boolean | (string | number | boolean)[];

// eslint-disable-next-line no-undef
export type SelectFieldProps = Pick<
  DropdownProps,
  | "id"
  | "disabled"
  | "loading"
  | "clearable"
  | "ref"
  | "required"
  | "multiple"
  | "search"
  | "value"
  | "options"
  | "placeholder"
> & {
  label?: string;
  className?: string;
  allowedValues?: string[];
  allowAdditions?: boolean;
  inputRef?: any;
  error?: boolean;
  transform?: (a: string) => string;
  onChange: (newValue: dropdownValue) => void;
};

function initializeOptions(
  options?: SelectFieldProps["options"],
  allowedValues?: SelectFieldProps["allowedValues"],
  transform?: SelectFieldProps["transform"]
) {
  return (
    options ||
    (allowedValues || []).map(allowedValue => {
      const isString = typeof allowedValue === "string";
      if (isString && !transform) {
        return { value: allowedValue, text: allowedValue };
      }

      return {
        value: allowedValue,
        text: transform ? transform(allowedValue) : allowedValue
      };
    })
  );
}

export const SelectField = ({
  className,
  clearable,
  allowedValues,
  allowAdditions,
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
  options, // [ {key, text, value}]
  transform,
  value = "",
  loading
}: SelectFieldProps) => {
  const [optionList, setOptionList] = useState<DropdownProps["options"]>([]);
  const handleAddition = (e, { value: addedValue }) => {
    setOptionList([{ text: addedValue, value: addedValue }, ...optionList]);
  };

  useEffect(() => {
    const opts = initializeOptions(options, allowedValues, transform);
    setOptionList(opts);
  }, [options, allowedValues, transform]);

  return (
    <div className={classNames("field", className, { required, error })}>
      {label && <label htmlFor={id}>{label}</label>}

      <Dropdown
        id={id}
        disabled={disabled}
        loading={loading}
        clearable={clearable}
        ref={inputRef}
        required={required}
        multiple={multiple}
        allowAdditions={allowAdditions}
        onAddItem={handleAddition}
        fluid
        search={search}
        selection
        value={value}
        options={optionList}
        label={label}
        placeholder={placeholder}
        onChange={(_, { value: changedValue }) => {
          onChange(changedValue);
        }}
      />
    </div>
  );
};

export default connectField<SelectFieldProps>(SelectField);
