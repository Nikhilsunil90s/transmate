/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import { Component } from "react";

export class AnalysisEditorBase extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = { value: value || "" };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef && onRef(this);
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
