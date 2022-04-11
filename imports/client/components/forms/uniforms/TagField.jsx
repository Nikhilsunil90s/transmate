import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import classNames from "classnames";
import { connectField } from "uniforms";

function buildOptions(tags = []) {
  return [...tags].map(value => ({ key: value, value, text: value }));
}

export const TagField = ({
  className,
  disabled,
  id,
  label,
  onChange,
  placeholder,
  required,
  error,
  value = []
}) => {
  const [dataInput, setDataInput] = useState(value);
  const [options, setOptions] = useState(buildOptions(value));

  const onchange = (e, { value: val = [] }) => {
    setDataInput(val);
    onChange(val);
  };
  const handleAddition = (e, { value: val }) => {
    // setDataInput([...dataInput, value]);
    setOptions([...options, { key: val, value: val, text: val }]);
  };
  return (
    <div className={classNames("field", className, { required, error })}>
      <label htmlFor={id}>{label}</label>

      <Dropdown
        placeholder={placeholder}
        disabled={disabled}
        fluid
        multiple
        selection
        search
        allowAdditions
        options={options}
        value={dataInput}
        onChange={onchange}
        onAddItem={handleAddition}
      />
    </div>
  );
};

export default connectField(TagField);
