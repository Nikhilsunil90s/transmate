import React from "react";
import { Select } from "semantic-ui-react";

const hasValueInOptions = (value, options) => {
  return options.find(option => {
    return (
      (typeof option === "string" && option === value) ||
      (typeof option === "object" && option.value === value)
    );
  });
};

const DropDownEditor = props => {
  const { options = [], value } = props;
  const shouldPushValueIntoOptions = !hasValueInOptions(value, options);

  if (shouldPushValueIntoOptions) {
    options.push(value);
  }

  return (
    <Select
      {...props}
      options={options.map(option => {
        const isString = typeof option === "string";
        if (isString) {
          return { value: option, text: option };
        }

        return option;
      })}
      onChange={(_, { value: newValue }) => props.onChange(newValue)}
    />
  );
};

export default DropDownEditor;
