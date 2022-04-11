/* eslint-disable react/no-unused-state */
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { Meteor } from "meteor/meteor";
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
import { SideBarModule } from "@ag-grid-enterprise/side-bar";

import { LicenseManager } from "@ag-grid-enterprise/core";
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";

import { isFunction } from "lodash";
import { splitCurrency } from "./_splitCurrency";

LicenseManager.setLicenseKey(Meteor.settings.public.AG_GRID);

// as grid data is stored as {}. This function sets is to proper string to ensure pasing in excel works
function processCellForClipboard(params) {
  return params.value?.unit ? `${params.value.value} ${params.value.unit}` : undefined;
}

function processDataFromClipboard({ data }) {
  return data.map(row => row.map(update => splitCurrency(update)));
}
function clearCells(start, end, columns, gridApi) {
  const itemsToUpdate = [];

  // eslint-disable-next-line no-plusplus
  for (let i = start; i <= end; i++) {
    const { data } = gridApi.rowModel.rowsToDisplay[i];
    columns.forEach(column => {
      data[column] = "";
    });
    itemsToUpdate.push(data);
  }

  gridApi.applyTransaction({ update: itemsToUpdate });
}

export class DataSheetCore extends Component {
  updates = [];

  pasting = false;

  constructor(props) {
    super(props);

    const { /* pinnedTopRowData, rowData,*/ columnDefs } = props;

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
      rowSelection: "multiple"
    };
  }

  onGridReady = params => {
    const { onGridReady = () => {} } = this.props;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    onGridReady(params);
  };

  triggerChanges() {
    const { onChange } = this.props;
    const { updates } = this;
    if (!updates || !updates.length) {
      return;
    }
    this.updates = [];
    onChange(updates);
  }

  /**
   * handles changes in cell BOTH in paste and edit
   * we allow users to edit values as <amount> <currency>
   * @param {} params
   */
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

  /**
   * Can not use async is a pain, it must return false to avoid break paste
   */
  onSuppressKeyboardEvent = params => {
    const { onDelete } = this.props;

    // can not trust this editing
    // eslint-disable-next-line no-unused-vars
    const { api: gridApi, editing } = params;
    const isBackspaceKey = params.event.keyCode === 8;
    const isDeleteKey = params.event.keyCode === 46;

    if (onDelete && (isBackspaceKey || isDeleteKey)) {
      const updates = [];
      const uiUpts = [];

      // nothing
      // const editingCells = gridApi.getEditingCells();
      gridApi.getCellRanges().forEach(range => {
        const colIds = range.columns.map(col => col.colId);

        const startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        const endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);

        // eslint-disable-next-line no-plusplus
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const row = gridApi.rowModel.rowsToDisplay[i];

          // it is the same
          // const rowNode = gridApi.getRowNode(row.id);
          const { rowIndex, data, rowPinned } = row;
          range.columns.forEach(col => {
            const { colDef, colId } = col;
            const editable = col?.colDef?.editable;
            if (!editable) {
              return;
            }
            if (isFunction(editable) && !editable({ colDef, node: row })) return;
            const oldValue = data[colId];
            updates.push({ rowPinned, rowIndex, colDef, oldValue });
          });
        }

        uiUpts.push({
          startRowIndex,
          endRowIndex,
          colIds
        });
      });
      if (!updates.length) {
        return false;
      }
      onDelete(updates).then(deleteResult => {
        // eslint-disable-next-line no-unused-expressions
        if (!deleteResult) return;
        uiUpts.map(({ startRowIndex, endRowIndex, colIds }) => {
          return clearCells(startRowIndex, endRowIndex, colIds, gridApi);
        });
      });

      return true;
    }

    return false;
  };

  render() {
    const {
      getMainMenuItems,
      getContextMenuItems,
      getRowStyle,
      getRowClass,
      style,
      pinnedTopRowData,
      rowData,
      columnDefs,
      frameworkComponents
    } = this.props;

    return (
      <div style={style}>
        <div
          style={{
            height: "93%",
            width: "100%"
          }}
          className="ag-theme-balham"
        >
          <AgGridReact
            getMainMenuItems={getMainMenuItems}
            getContextMenuItems={getContextMenuItems}
            getRowStyle={getRowStyle}
            getRowClass={getRowClass}
            preventDefaultOnContextMenu
            suppressContextMenu={false}
            suppressRowClickSelection
            suppressKeyboardEvent={this.onSuppressKeyboardEvent.bind(this)}
            pinnedTopRowData={pinnedTopRowData}
            columnDefs={columnDefs}
            defaultColDef={this.state.defaultColDef}
            enableRangeSelection
            rowSelection={this.state.rowSelection}
            onGridReady={this.onGridReady}
            onCellValueChanged={this.onCellValueChanged.bind(this)}
            onPasteStart={this.onPasteStart.bind(this)}
            onPasteEnd={this.onPasteEnd.bind(this)}
            processCellForClipboard={processCellForClipboard}
            processDataFromClipboard={processDataFromClipboard}
            rowData={rowData}
            frameworkComponents={frameworkComponents}
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
              MultiFilterModule,
              SideBarModule
            ]}
          />
        </div>
      </div>
    );
  }
}
