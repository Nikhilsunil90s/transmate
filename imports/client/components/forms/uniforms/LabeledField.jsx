import React from "react";
import { Input } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

const LabeledField = ({
  disabled,
  id,
  inputRef,
  label,
  inputLabel,
  labelPosition = "right",
  type = "number",
  onChange,
  placeholder,
  required,
  error,
  className,
  value = null
}) => {
  return (
    <div className={classNames("field", { required, error }, className)}>
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        disabled={disabled}
        ref={inputRef}
        placeholder={placeholder}
        onChange={(_, { value: updatedValue }) => {
          let val = updatedValue;
          if (type === "number") {
            val = Number(updatedValue);
          }
          onChange(val);
        }}
        label={inputLabel}
        labelPosition={labelPosition}
        value={value}
        type={type}
      />
    </div>
  );
};

export default connectField(LabeledField);
