/* eslint-disable prettier/prettier */
import React from "react";
import { AnalysisEditorBase } from "./AnalysisEditorBase";

export class AnalysisDropDownEditor extends AnalysisEditorBase {
  render() {
    const { options, disabled } = this.props;
    return (
      <select
        disabled={disabled}
        style={{ width: "100%", height: "100%" }}
        value={this.state.value}
        onChange={this.handleChange}
      >
        {options.map(({ text, value }, index) => (
          <option key={index} value={value}>
            {text}
          </option>
        ))}
      </select>
    );
  }
}
