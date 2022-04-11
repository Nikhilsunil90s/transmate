import React from "react";
import { Input, Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { useField } from "uniforms";

// input field with a labeled dropdown select
const LabeledField = ({
  label,
  placeholder,
  inputName,
  dropdownName,
  dropdownOptions,
  dropdownDefaultValue,
  required,
  error,
  disabled,
  className,
  ...props
}) => {
  const [inputProps] = useField(inputName, props);
  const [dropDownProps] = useField(dropdownName, props);

  return (
    <div
      className={classNames("field", className, {
        required: inputProps.required,
        error: inputProps.error
      })}
    >
      <label>{label}</label>
      <Input
        {...props}
        disabled={inputProps.disabled}
        placeholder={placeholder}
        onChange={(_, { value: updatedValue }) => {
          let val = updatedValue;
          if (props.type === "number") {
            val = parseFloat(updatedValue) || 0;
          }
          inputProps.onChange(val);
        }}
        label={
          <Dropdown
            disabled={disabled}
            onChange={(_, { value: updatedValue }) => {
              dropDownProps.onChange(updatedValue);
            }}
            options={dropdownOptions}
            value={dropDownProps.value || dropdownDefaultValue}
          />
        }
        labelPosition="right"
        value={inputProps.value}
      />
    </div>
  );
};

LabeledField.contextTypes = useField.contextTypes;

export default LabeledField;
