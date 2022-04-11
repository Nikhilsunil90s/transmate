import React from "react";
import { Checkbox } from "semantic-ui-react";
import { connectField } from "uniforms";

const debug = require("debug")("react:toggle");

const Toggle = ({ disabled, id, inputRef, onChange, value, label }) => {
  debug("set toggle ", { disabled, id, inputRef, onChange, value });
  return (
    <Checkbox
      id={id}
      disabled={disabled}
      ref={inputRef}
      checked={value || false}
      toggle
      label={label}
      onChange={() => {
        debug("value of %s toggle changed! to:", id, !value);
        onChange(!value);
      }}
    />
  );
};

export default connectField(Toggle);
