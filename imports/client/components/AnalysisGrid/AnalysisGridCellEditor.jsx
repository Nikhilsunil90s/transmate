/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { AnalysisTextEditor } from "./AnalysisTextEditor";
import { AnalysisDropDownEditor } from "./AnalysisDropDownEditor";
import { AnalysisNumberEditor } from "./AnalysisNumberEditor";

/**
 * https://www.ag-grid.com/javascript-grid-cell-editor/#example-cell-editing-using-react-components
 */
export class AnalysisGridCellEditor extends Component {
  childRef = null;

  constructor(props) {
    super(props);

    const { rowIndex, value, colDef, node: rowNode } = props;
    const { field, meta } = colDef;
    const { rowPinned } = rowNode;
    const cellMeta = meta.getCellMeta({ rowIndex, field, rowPinned });

    const { formatMeta, type } = cellMeta;
    const { editor: enableEditor } = formatMeta;

    let editor = AnalysisTextEditor;
    const editorParams = { value, disabled: enableEditor === false };

    if (type === "dropdown") {
      editor = AnalysisDropDownEditor;
      editorParams.options = formatMeta.source.map(s => {
        return { text: s, value: s };
      });
    } else if (type === "numeric") {
      editor = AnalysisNumberEditor;
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

  handleChange = value => {
    // :parse value
    let parsedValue = null;
    if (this.metaType === "numeric") {
      parsedValue = parseFloat(value);
    } else {
      parsedValue = value;
    }
    this.setState({ value: parsedValue });
  };

  afterGuiAttached() {
    this.childRef && this.childRef.afterGuiAttached && this.childRef.afterGuiAttached();
  }

  render() {
    const Editor = this.state.editor;
    return (
      // eslint-disable-next-line no-return-assign
      <Editor
        onRef={ref => {
          this.childRef = ref;
        }}
        onChange={this.handleChange}
        {...this.state.editorParams}
       />
    );
  }
}
