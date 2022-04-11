import React from "react";
import { connectField } from "uniforms";

export const StaticField = ({ id, label, value = "" }) => {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <p id={id}>{value}</p>
    </div>
  );
};

export default connectField(StaticField);
