/* eslint-disable react/no-unused-state */
/* eslint-disable class-methods-use-this */
/* eslint-disable radix */
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */

import React, { Component } from "react";
import { AgGridReact } from "@ag-grid-community/react";

// AG grid modules:
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";

import { LicenseManager } from "@ag-grid-enterprise/core";
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";

import { oPath } from "../../../utils/functions/path";
import { AnalysisGridCellEditor } from "./AnalysisGridCellEditor";

LicenseManager.setLicenseKey(Meteor.settings.public.AG_GRID);

export class AnalysisGrid extends Component {
  updates = [];

  pasting = false;

  rawData = null;

  constructor(props) {
    super(props);

    const { /* pinnedTopRowData, rowData,*/ columnDefs } = props;

    const columnsMeta = props.columns;

    // https://www.ag-grid.com/javascript-grid-column-properties/
    this.state = {
      columnDefs,
      defaultColDef: {
        suppressMovable: true,
        editable: true,
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: false
      },
      rowSelection: "multiple",
      frameworkComponents: {
        dynamicCellEditor: AnalysisGridCellEditor
      },
      columnsMeta
    };
  }

  get pinnedRowCount() {
    return this.state.pinnedTopRowData ? this.state.pinnedTopRowData.length : 0;
  }

  getCellMeta({ rowIndex, field, rowPinned }) {
    const formatMeta = { editor: false };

    // this type is for pinned header
    const cellMeta = { formatMeta, type: "text" };
    const cellIndex = parseInt(field);

    // eslint-disable-next-line no-unused-vars
    let dataRowIndex = rowIndex;
    const dataColIndex = cellIndex;

    // columnsUIMeta and cellFormatAndDropdowns both exclude the header row(first column)
    if (rowPinned !== "top") {
      // eslint-disable-next-line no-unused-vars
      dataRowIndex += this.pinnedRowCount;

      // normal cell
      const { editor, type, readOnly } = this.state.columnsMeta[dataColIndex];
      formatMeta.editor = readOnly ? false : editor;
      cellMeta.type = type;
    } else {
      // will not go here
    }

    return cellMeta;
  }

  getCellEditable(params) {
    // refer https://www.ag-grid.com/javascript-grid-cell-editing/
    const { node: rowNode, colDef } = params;
    const { rowIndex, rowPinned } = rowNode;
    const { field } = colDef;
    const meta = this.getCellMeta({ rowIndex, field, rowPinned });
    const { formatMeta } = meta;
    const { editor: enableEditor } = formatMeta;

    const editable = enableEditor !== false;

    return editable;
  }

  valueFormatter(params) {
    const { value, node: rowNode } = params;
    if (!value) {
      return value;
    }
    // eslint-disable-next-line no-unused-vars
    const { rowIndex, rowPinned } = rowNode;
    if (rowPinned) {
      return value;
    }
    return value.toLocaleString("default", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  convertStructure() {
    const {
      data,

      // rowH,
      colH,
      columns

      // onSave, // cell by cell after validation
      // afterChange, // raw handler
      // cell,
      // settings
    } = this.props;

    this.rawData = data;
    const commonColumSetting = { suppressMenu: true };
    const rowData = [];
    const pinnedTopRowData = [];
    const columnDefs = [];

    const structure = {
      pinnedTopRowData,
      rowData,
      columnDefs,

      // special case will hide header
      headerHeight: 0
    };

    columns.map((c, index) => {
      const colIndexStr = `${index}`;
      const nc = {
        ...commonColumSetting,
        headerName: "",
        headerHeight: 0,
        editable: this.getCellEditable.bind(this),
        valueFormatter: this.valueFormatter,
        field: colIndexStr,
        cellEditor: "dynamicCellEditor",
        meta: { getCellMeta: this.getCellMeta.bind(this) }
      };
      columnDefs.push(nc);
      return nc;
    });

    // when colH is not empty
    if (colH && colH.length) {
      // show header, use default setting
      delete structure.headerHeight;
      colH.forEach((c, index) => {
        const agColDef = columnDefs[index];
        agColDef.headerName = c;
      });
    }

    (data || []).map(r => {
      const nr = {};
      columns.map((c, j) => {
        const colIndexStr = `${j}`;
        nr[colIndexStr] = oPath(c.data.split("."), r);
        return null;
      });
      rowData.push(nr);
      return null;
    });

    return structure;
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  };

  triggerChanges() {
    const { onSave: onChange, afterChange } = this.props;
    const { updates } = this;
    if (!updates || !updates.length) {
      return;
    }
    const afterChangeParams = [];
    const changes = updates.map(({ rowPinned, rowIndex, colDef, newValue }) => {
      const { field, meta } = colDef;
      const cellIndex = parseInt(field);
      const { data: fieldName } = this.state.columnsMeta[cellIndex];
      const row = rowPinned ? rowIndex : this.pinnedRowCount + rowIndex;
      const rowData = this.rawData[row];

      const cellMeta = meta.getCellMeta({ rowIndex, field, rowPinned });
      let value = newValue;
      if (cellMeta.type === "numeric") {
        value = parseFloat(value);
      }

      afterChangeParams.push({ rowData, update: { [fieldName]: value } });

      // it exclude the rowHeader
      return [rowData, { [fieldName]: value }];
    });
    this.updates = [];

    try {
      // row data and field value, it should always be one field
      const [rowData, update] = changes[0];
      // eslint-disable-next-line no-unused-expressions
      onChange && onChange(rowData, update);
    } finally {
      // eslint-disable-next-line no-unused-expressions
      afterChange && afterChange(afterChangeParams, "paste");
    }
  }

  onCellValueChanged = params => {
    if (this.pasting) {
      this.updates.push(params);
    } else {
      this.updates = [params];
      this.triggerChanges();
    }
  };

  onPasteStart = () => {
    this.pasting = true;
  };

  onPasteEnd = () => {
    this.pasting = false;
    this.triggerChanges();
  };

  render() {
    const { style } = this.props;

    const { headerHeight, rowData, columnDefs, pinnedTopRowData } = this.convertStructure();

    return (
      <div style={style || { height: "100%" }}>
        <div
          style={{
            height: "93%",
            width: "100%"
          }}
          className="ag-theme-balham"
        >
          <AgGridReact
            singleClickEdit
            headerHeight={headerHeight}
            preventDefaultOnContextMenu
            suppressContextMenu
            suppressRowClickSelection
            pinnedTopRowData={pinnedTopRowData}
            columnDefs={columnDefs}
            defaultColDef={this.state.defaultColDef}
            enableRangeSelection
            rowSelection={this.state.rowSelection}
            onGridReady={this.onGridReady}
            onCellValueChanged={this.onCellValueChanged.bind(this)}
            onPasteStart={this.onPasteStart.bind(this)}
            onPasteEnd={this.onPasteEnd.bind(this)}
            rowData={rowData}
            frameworkComponents={this.state.frameworkComponents}
            modules={[
              ClientSideRowModelModule,
              ExcelExportModule,
              ClipboardModule,
              MenuModule,
              ColumnsToolPanelModule,
              FiltersToolPanelModule,
              RangeSelectionModule,
              RichSelectModule,
              SetFilterModule,
              MultiFilterModule
            ]}
          />
        </div>
      </div>
    );
  }
}
