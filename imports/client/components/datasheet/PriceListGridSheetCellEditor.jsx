/* eslint-disable react/no-unused-state */
/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { DsDropDownEditor } from "./DsDropDownEditor";
import { DsTextEditor } from "./DsTextEditor";
import { DsNumberEditor } from "./DsNumberEditor";
import { DsCurrencyEditor } from "./DsCurrencyEditor";

import { splitCurrency } from "./_splitCurrency";

export class PriceListGridSheetCellEditor extends Component {
  constructor(props) {
    super(props);
    const { rowIndex, value, colDef, node: rowNode } = props;
    const { field, meta } = colDef;
    const { rowPinned } = rowNode;
    const cellMeta = meta.getCellMeta({ rowIndex, field, rowPinned });

    const { formatMeta, type } = cellMeta;
    const { editor: enableEditor } = formatMeta;

    let editor = DsTextEditor;
    const editorParams = { value, disabled: enableEditor === false };

    if (type === "dropdown") {
      editor = DsDropDownEditor;
      editorParams.options = formatMeta.source.map(s => {
        return { text: s, value: s };
      });
    } else if (type === "numeric") {
      editor = DsNumberEditor;
    } else if (type === "currency") {
      editor = DsCurrencyEditor;
      editorParams.value = value?.value;
    }
    this.state = { value, cellMeta, rowPinned, editorParams, editor };
  }

  get metaType() {
    const { rowIndex, colDef, node: rowNode } = this.props;
    const { field, meta } = colDef;
    const { rowPinned } = rowNode;
    const cellMeta = meta.getCellMeta({ rowIndex, field, rowPinned });

    const { type } = cellMeta;

    return type;
  }

  getValue() {
    return this.state.value;
  }

  handleChange = inputValue => {
    // :parse value
    let parsedValue = null;
    if (this.metaType === "numeric" && inputValue !== "") {
      parsedValue = parseFloat(inputValue);
    } else if (this.metaType === "currency" && inputValue !== "") {
      const { value: oldValObj } = this.state;

      const { value, unit } = splitCurrency(inputValue);

      parsedValue = {
        ...(oldValObj || {}),
        value: parseFloat(value),
        ...(unit ? { unit } : {})
      };
    } else {
      parsedValue = inputValue;
    }
    this.setState({ value: parsedValue });
  };

  render() {
    const Editor = this.state.editor;
    return <Editor onChange={this.handleChange} {...this.state.editorParams} />;
  }
}
