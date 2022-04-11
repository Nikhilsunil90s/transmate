/* eslint-disable */
import React, { Component } from "react";

export class DsEditorBase extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = { value: value || "" };
  }

  handleChange = e => {
    const { value } = e.target;
    const { onChange, disabled } = this.props;
    if (disabled) {
      return;
    }
    this.setState({ value });
    onChange(value);
  };
}
