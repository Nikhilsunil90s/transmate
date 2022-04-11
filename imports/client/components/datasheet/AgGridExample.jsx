/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/button-has-type */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-duplicates */
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

import { LicenseManager } from "@ag-grid-enterprise/core";

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

LicenseManager.setLicenseKey(Meteor.settings.public.AG_GRID);

export class AgGridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columnDefs: [
        {
          field: "athlete",
          minWidth: 200
        },
        { field: "age" },
        {
          field: "country",
          minWidth: 150
        },
        { field: "year" },
        {
          field: "date",
          minWidth: 150
        },
        {
          field: "sport",
          minWidth: 150
        },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
      ],
      defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        resizable: true
      },
      rowSelection: "multiple",
      rowData: [],
      pinnedTopRowData: []
    };
    const topRow = {};
    this.state.columnDefs.forEach(c => {
      topRow[c.field] = c.field;
    });

    this.state.pinnedTopRowData.push(topRow);
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    const httpRequest = new XMLHttpRequest();
    const updateData = data => {
      this.setState({ rowData: data });
    };

    httpRequest.open(
      "GET",
      "https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json"
    );
    httpRequest.send();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText));
      }
    };
  };

  onCellValueChanged = params => {
    console.log("Callback onCellValueChanged:", params);
  };

  onPasteStart = params => {
    console.log("Callback onPasteStart:", params);
  };

  onPasteEnd = params => {
    console.log("Callback onPasteEnd:", params);
  };

  onBtCopyRows = () => {
    this.gridApi.copySelectedRowsToClipboard();
  };

  onBtCopyRange = () => {
    this.gridApi.copySelectedRangeToClipboard();
  };

  onPasteOff = () => {
    this.gridApi.setSuppressClipboardPaste(true);
  };

  onPasteOn = () => {
    this.gridApi.setSuppressClipboardPaste(false);
  };

  render() {
    return (
      <div style={{ width: "100%", height: "500px" }}>
        <div style={{ paddingBottom: "5px" }}>
          <button onClick={() => this.onBtCopyRows()}>Copy Selected Rows to Clipboard</button>
          <button onClick={() => this.onBtCopyRange()}>Copy Selected Range to Clipboard</button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={() => this.onPasteOn()}>Toggle Paste On</button>
          <button onClick={() => this.onPasteOff()}>Toggle Paste Off</button>
        </div>

        <div
          id="myGrid"
          style={{
            height: "93%",
            width: "100%"
          }}
          className="ag-theme-alpine"
        >
          <AgGridReact
            pinnedTopRowData={this.state.pinnedTopRowData}
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            enableRangeSelection
            rowSelection={this.state.rowSelection}
            onGridReady={this.onGridReady}
            onCellValueChanged={this.onCellValueChanged.bind(this)}
            onPasteStart={this.onPasteStart.bind(this)}
            onPasteEnd={this.onPasteEnd.bind(this)}
            rowData={this.state.rowData}
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
