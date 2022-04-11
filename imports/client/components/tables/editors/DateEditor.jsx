import React from "react";
import { DateInput } from "semantic-ui-calendar-react";

const DateEditor = props => {
  return (
    <DateInput
      {...props}
      dateFormat="L"
      closable
      animation="none"
      onChange={(_, { value: updatedValue }) => props.onChange(updatedValue)}
    />
  );
};

export default DateEditor;
