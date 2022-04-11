/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable class-methods-use-this */
/* eslint-disable prettier/prettier */
import React from "react";
import get from "lodash.get";
import { DataSheetCore } from "./DataSheetCore";
import { PriceListGridSheetCellEditor } from "./PriceListGridSheetCellEditor";
import { getGridContextMenuComp } from "../../../utils/priceList/grid_contextMenuComp";
import { PriceListGridSheetHeader } from "./PriceListGridSheetHeader";

import { saveRates } from "/imports/utils/priceList/grid_saveRates";

// import './price-list-grid-sheet.less';

const debug = require("debug")("component:datasheet:pricelist");

export class PriceListGridSheet extends React.Component {
  priceListComp = null;

  contextMenuComp = null;

  agGridApi = null;

  constructor(props) {
    super(props);
    const { priceListComp, onInitialized } = props;

    this.priceListComp = priceListComp;

    this.priceListComp.onRefresh = () => {
      // only here can get the access control data
      this.contextMenuComp = getGridContextMenuComp(this.priceListComp, this.t).get();
      this.freshData();
    };

    // initialize the table

    // const oldStructure = {
    //     rowHeaders: this.priceListComp.getHeaders("rows"),
    //     colHeaders: this.priceListComp.getHeaders("cols"),
    //     columns: this.priceListComp.getColumns(true),
    //     data: this.priceListComp.initializeData(),
    // };

    // const structure = this.convertDataStructure(oldStructure);

    this.state = {
      pinnedTopRowData: [],
      rowData: [],
      columnDefs: [],
      frameworkComponents: {
        dynamicCellEditor: PriceListGridSheetCellEditor
      },
      cellFormatAndDropdowns: []
    };
  }

  async freshData() {
    const structure = this.convertDataStructure();

    this.setState({ ...structure });
  }

  async componentDidMount() {
    this.freshData();
  }

  getRowClass(_params) {
    // want to change the row height, did not work
    return "my-row";
  }

  onGridReady(params) {
    this.agGridApi = params.api;

    // this.agGridApi.showColumnMenuAfterMouseClick('0', 'click');
  }

  getRowStyle(params) {
    const { node: rowNode } = params;
    const { rowPinned } = rowNode;

    const rowStyle = {};

    // https://www.ag-grid.com/javascript-grid-row-styles/
    if (rowPinned) {
      rowStyle.backgroundColor = "#f5f6f9";
    }
    return rowStyle;
  }

  getCellStyle(params) {
    // https://www.ag-grid.com/javascript-grid-cell-styles/
    if (params.value === "Police") {
      // mark police cells as red
      return { backgroundColor: "#f5f6f9" };
    }
    return null;
  }

  /**
   * passes on the changes to the gridClass
   * @param {{rowPinned: Number, rowIndex:Number, colDef: String, node: Object, oldValue:{Object|String}, newValue:{Object|String}}[]} updates
   */
  handleOnChange = updates => {
    const { onSave } = this.props;
    const changes = updates.map(
      ({ rowPinned, rowIndex, colDef, node: rowNode, oldValue, newValue }) => {
        const { field } = colDef;
        const row = rowPinned ? rowIndex : this.state.pinnedTopRowData.length + rowIndex;

        // it exclude the rowHeader
        const col = parseInt(field) - 1;
        return [row, col, oldValue, newValue];
      }
    );

    const changesData = this.priceListComp.parseChanges(changes); // returns { priceListId, updates }
    saveRates.call(this.priceListComp, changesData);
  };

  /**
   * function to get cell meta data when the editor is activated
   * @param {*} param0
   * @param {Number} rowIndex row number - excluding pinnedRows
   * @param {String} field column ID (index # as string)
   * @param {String} rowPinned is row pinned to ["top", "bottom"]
   */
  getCellMeta({ rowIndex, field, rowPinned }) {
    const { base, gridcols, gridrows } = this.priceListComp;

    const formatMeta = { editor: false };

    // this type is for pinned header
    const cellMeta = { formatMeta, type: "text" };
    const cellIndex = parseInt(field);

    let dataRowIndex = rowIndex;
    const dataColIndex = cellIndex - 1;

    // columnsUIMeta and cellFormatAndDropdowns both exclude the header row(first column)
    if (rowPinned !== "top") {
      dataRowIndex += this.state.pinnedTopRowData.length;

      // normal cell
      const { editor, type } = this.state.columnsUIMeta[dataColIndex];
      formatMeta.editor = editor;
      cellMeta.type = type;
    } else {
      // row Index is start from 0(the first row, not header)
      const rowsColsDef = gridcols.slice(1);

      const rdef = rowsColsDef[dataRowIndex];

      // this always should be true
      if (rowIndex < rowsColsDef.length) {
        Object.assign(cellMeta, rdef[dataColIndex]);
      }
    }

    // find format
    const foundFormat = this.state.cellFormatAndDropdowns.find(({ row, col }) => {
      const found = row === dataRowIndex && col === dataColIndex;
      return found;
    });

    if (foundFormat) {
      // const {editor} = cellMeta
      cellMeta.formatMeta = foundFormat;
      cellMeta.type = foundFormat.type;
    }

    return cellMeta;
  }

  /**
   * cell formatter - for displaying cell value (not the editor)
   * @param {String|Object} params cell value where headers are passed in as string,
   * values as object {value, unit}
   */
  valueFormatter(params) {
    const { value, node: rowNode } = params;
    if (!value) {
      return value;
    }
    const { rowIndex, rowPinned } = rowNode;
    const isString = typeof value === "string";

    if (rowPinned || isString) {
      return value;
    }

    const currency = value.unit;
    const amount = value.value || "";
    return amount.toLocaleString("default", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
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

  onCellContextMenu(_params) {}

  getMainMenuItems(params) {
    // https:// www.ag-grid.com/javascript-grid-column-menu/#example-column-menu
    // header main menu as context menu
    const { column, api } = params;
    const { colDef } = column;
    const { field } = colDef;
    const cellIndex = parseInt(field);

    // this will still show empty menu
    // if (!cellIndex) {
    //     // left top header need not context menu?
    //     return false;
    // }

    // [startRow, startCol, endRow, endCol]
    const dataRowIndex = -1;
    const dataCellIndex = cellIndex - 1;
    const selection = [[dataRowIndex, dataCellIndex, dataRowIndex, dataCellIndex]];
    return this.buildContextMenu({
      cellIndex,
      rowIndex: -1,
      rowPinned: false,
      selection
    });
  }

  buildMenuItem({ selection, item, rowIndex, cellIndex, rowPinned }) {
    const { onContextMenu } = this.props;
    const pinnedRowCount = this.state.pinnedTopRowData.length;

    const hiddenParams = {
      isBody: true,
      row: rowPinned ? rowIndex : rowIndex + pinnedRowCount,
      col: cellIndex - 1,
      isColHeader: rowIndex < 0,
      isRowHeader: cellIndex < 1,
      selection
    };
    hiddenParams.isBody = !hiddenParams.isColHeader && !hiddenParams.isRowHeader;
    if (item.hidden && item.hidden(hiddenParams)) {
      return null;
    }

    const callbackParams = { ...hiddenParams };

    // rate.disabled();
    const menuItem = {
      name: item.name,
      disabled: false,
      action: () => {
        // const renderCallback = item.callback(callbackParams);
        // onContextMenu(renderCallback);
        const callData = item.callback(callbackParams);
        onContextMenu(callData);
      }
    };

    // disable check

    if (item.disabled) {
      const disabledParams = { ...hiddenParams };
      menuItem.disabled = item.disabled(disabledParams);
    }

    return menuItem;
  }

  getContextMenuItems(params) {
    const { node: rowNode, column, api } = params;
    const { rowIndex, rowPinned } = rowNode;
    const { colDef } = column;
    const { field } = colDef;
    const cellIndex = parseInt(field);
    const pinnedRowCount = this.state.pinnedTopRowData.length;

    const selection = api.getCellRanges();

    // selection https://www.ag-grid.com/javascript-grid-range-selection/#api-getcellranges
    const formartSel = selection.map(({ startRow, endRow, columns }) => {
      const startRowIndex = startRow.rowPinned
        ? startRow.rowIndex
        : startRow.rowIndex + pinnedRowCount;
      const startCellIndex = parseInt(columns[0].colId);
      const endRowIndex = endRow.rowPinned ? endRow.rowIndex : endRow.rowIndex + pinnedRowCount;
      const endCellIndex = parseInt(columns[columns.length - 1].colId);
      const leftTop = [startRowIndex, startCellIndex - 1];
      const rightBottom = [endRowIndex, endCellIndex - 1];
      return [...leftTop, ...rightBottom];
    });

    const menus = this.buildContextMenu({
      cellIndex,
      rowIndex,
      rowPinned,
      selection: formartSel
    });

    // default xls export
    menus.push({
      name: "export",
      disabled: false,
      action() {
        debug("export called for");
        api.exportDataAsExcel({
          processCellCallback(cell) {
            // format for xls
            if (typeof (cell.value || cell.label) === "string") return cell.value || cell.label;

            // rate value, with data
            if (get(cell, "value.value"))
              return `${get(cell, "value.value", "___")} ${get(cell, "value.unit", "EUR")}`;

            // rate but no data
            if (
              typeof cell.value === "object" &&
              Object.keys(cell.value).includes("value") &&
              Object.keys(cell.value).includes("unit")
            )
              return `___ EUR`;
            return "";
          }
        });
      }
    });
    return menus;
  }

  buildContextMenu({ cellIndex, rowIndex, rowPinned, selection }) {
    const menus = ["copy"];

    if (this.contextMenuComp) {
      const { disabled, items } = this.contextMenuComp;

      // to do : temporary block on contect menu
      if (disabled) {
        return menus;
      }
      ["rate", "comment", "-", "lane", "equipment", "volume", "charge"].forEach(itemName => {
        if (itemName === "-") {
          menus.push("separator");
          return;
        }
        const item = items[itemName];
        const menuItem = this.buildMenuItem({
          selection,
          item,
          rowIndex,
          cellIndex,
          rowPinned
        });

        if (menuItem) {
          menus.push(menuItem);
        }
      });
    }

    // remove unnecessary separator
    if (menus[menus.length - 1] === "separator") {
      menus.splice(-1, 1);
    }

    return menus;
  }

  convertDataStructure() {
    const { base: oldData, gridcols, gridrows, data: oldData2 } = this.priceListComp;

    const { rowHeaders, colHeaders, columnsUIMeta } = {
      rowHeaders: this.priceListComp.getHeaders("rows"),
      colHeaders: this.priceListComp.getHeaders("cols"),
      columnsUIMeta: this.priceListComp.getColumns()
    };

    const cellFormatAndDropdowns = this.priceListComp.setCellFormatAndDropdowns();

    const rowData = [];
    const pinnedTopRowData = [];
    const commonColumSetting = {
      menuTabs: ["generalMenuTab"],
      headerComponentFramework: PriceListGridSheetHeader,
      suppressMenu: true,
      onCellContextMenu: this.onCellContextMenu
    };
    const columns = [
      {
        ...commonColumSetting,
        headerName: "",
        field: "0",
        editable: false,
        cellStyle: { "background-color": "#f5f6f9" }
      }
    ];
    const structure = {
      pinnedTopRowData,
      rowData,
      columnDefs: columns,

      // this meta is for the pinned headers
      cellFormatAndDropdowns,

      // this meta is for the normal column cell
      columnsUIMeta
    };

    // first real header
    // https://www.ag-grid.com/javascript-grid-column-properties/
    colHeaders.map((c, index) => {
      const colIndexStr = `${index + 1}`;
      const nc = {
        ...commonColumSetting,
        headerName: c,
        editable: this.getCellEditable.bind(this),
        valueFormatter: this.valueFormatter,
        field: colIndexStr,
        cellEditor: "dynamicCellEditor",
        meta: { getCellMeta: this.getCellMeta.bind(this) }
      };
      columns.push(nc);
      return nc;
    });

    // pinned header rows
    const pinnedCols = gridcols.slice(1);

    pinnedCols.map(headRow => {
      const pinRowData = { "0": rowHeaders[0] };
      pinnedTopRowData.push(pinRowData);

      headRow.map((c, index) => {
        const colIndexStr = `${index + 1}`;
        pinRowData[colIndexStr] = c.value;
        return null;
      });
      return null;
    });

    const pinnedRowCount = pinnedTopRowData.length;

    const otherData = oldData.slice(pinnedRowCount);
    otherData.map((r, i) => {
      const nr = { "0": rowHeaders[i + pinnedRowCount] };
      r.map((c, j) => {
        const colIndexStr = `${j + 1}`;

        if (c && c.isHeader) {
          nr[colIndexStr] = c.value || c.label;
        } else {
          // the fields are {value, unit} -> so we can render currency:
          nr[colIndexStr] = { value: c?.amount?.value, unit: c?.amount?.unit };
        }
        return null;
      });
      rowData.push(nr);
      return null;
    });

    return structure;
  }

  // componentDidUpdate(){
  //     this.priceListComp.ref
  // }

  render() {
    const { style } = this.props;

    return (
      <DataSheetCore
        style={style}
        getMainMenuItems={this.getMainMenuItems.bind(this)}
        onGridReady={this.onGridReady.bind(this)}
        getContextMenuItems={this.getContextMenuItems.bind(this)}
        getRowStyle={this.getRowStyle}
        getRowClass={this.getRowClass}
        onChange={this.handleOnChange}
        frameworkComponents={this.state.frameworkComponents}
        pinnedTopRowData={this.state.pinnedTopRowData}
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}
      />
    );
  }
}
