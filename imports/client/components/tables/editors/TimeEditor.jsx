import React from "react";
import { TimeInput } from "semantic-ui-calendar-react";

const TimeEditor = props => {
  return (
    <TimeInput
      {...props}
      timeFormat="AMPM"
      closable
      animation="none"
      onChange={(_, { value }) => props.onChange(value)}
    />
  );
};

export default TimeEditor;
