import React from "react";

import { Input } from "semantic-ui-react";

/** multiple select */
const ShipmentsViewFilterInput = ({ filter, field, placeholder, onChange }) => {
  const { value = "" } = filter;
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(_, { value: newValue }) => onChange(field, { value: newValue })}
    />
  );
};

export default ShipmentsViewFilterInput;
