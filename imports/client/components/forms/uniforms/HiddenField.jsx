import React from "react";
import { connectField } from "uniforms";

const HiddenField = props => (
  <input
    disabled={props.disabled}
    id={props.id}
    name={props.name}
    onChange={event => props.onChange(event.target.value)}
    placeholder={props.placeholder}
    type={props.type || "hidden"}
    value={props.value}
  />
);

export default connectField(HiddenField);
