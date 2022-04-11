/* eslint-disable no-unused-vars */
import { Meteor } from "meteor/meteor";
import get from "lodash.get";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";

// AG grid modules:
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";

// import styles;
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

import { LicenseManager } from "@ag-grid-enterprise/core";

import CurrencyRender, { currencyOpts } from "./components/CurrencyCellRenderer";
import CheckBoxRenderer from "./components/CheckBoxCell";
import CountryFlag, { countryOptions } from "./components/CountryFlagDropDown";
import { numberFormatter } from "./components/formatters";
import { numberParser } from "./components/parsers";
import { objAssignDeep } from "/imports/utils/functions/fnObjectAssignDeep";
import PercentCell from "./components/PercentCell";
import CurrencyCell from "./components/CurrencyCell";

LicenseManager.setLicenseKey(Meteor.settings.public.AG_GRID);

const STATIC_STYLE = { backgroundColor: "#44546A", color: "#FFFFFF" };

const Grid = ({
  forwardRef,
  columnDefs = [],
  rowData = [],
  defaultColDef = {},
  columnTypes = {},
  staticStyle, // {background: "", color""}
  getContextMenuItems, // returns [] of contextmenuitems
  onGridReady: runOnGridReady,
  onFirstDataRendered: runOnFirstDataRendered,
  getRowNodeId,
  onSave: onChange,
  afterChange,
  isExternalFilterPresent,
  doesExternalFilterPass,
  context = {},
  ...otherOptions
}) => {
  let pasting;
  let updates = [];
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const onGridReady = params => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    // eslint-disable-next-line no-unused-expressions
    runOnGridReady && runOnGridReady(params.api, params.columnApi);

    // eslint-disable-next-line no-unused-expressions
    forwardRef && forwardRef(params.api);
  };

  const triggerChanges = () => {
    if (!updates || !updates.length) return;

    // eslint-disable-next-line no-unused-expressions
    afterChange && afterChange(updates);
  };

  const onCellValueChanged = params => {
    if (pasting) {
      updates.push(params);
    } else {
      updates = [params];
      triggerChanges();
    }
  };

  const onPasteStart = () => {
    pasting = true;
  };

  const onPasteEnd = () => {
    pasting = false;
    triggerChanges();
    updates = [];
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <div className="example-wrapper">
        <div className="grid-wrapper">
          <div
            id="myGrid"
            style={{
              height: "600px",
              width: "100%"
            }}
            className="ag-theme-alpine"
          >
            <AgGridReact
              {...otherOptions}
              preventDefaultOnContextMenu
              suppressContextMenu={!getContextMenuItems}
              // eslint-disable-next-line lines-around-comment
              // row selection is needed for the context menu to get the selected ranges
              // suppressRowClickSelection
              rowSelection="multiple"
              suppressRowTransform // for row spanning
              suppressCopyRowsToClipboard
              enableRangeSelection
              enterMovesDown
              enterMovesDownAfterEdit
              getRowNodeId={getRowNodeId}
              allowContextMenuWithControlKey={!!getContextMenuItems}
              getContextMenuItems={getContextMenuItems}
              rowData={rowData}
              isExternalFilterPresent={isExternalFilterPresent}
              doesExternalFilterPass={doesExternalFilterPass}
              context={context}
              defaultColDef={{
                // flex: 1,
                minWidth: 80,
                editable: false,
                resizable: true,
                sortable: false,
                ...defaultColDef
              }}
              columnTypes={{
                static: {
                  editable: false,
                  resizable: true,
                  cellStyle: staticStyle || STATIC_STYLE
                },
                editable: {
                  editable: true,

                  // avoids issue with immutable data:
                  valueSetter: params => {
                    const { colDef, newValue } = params;

                    // this is to assign with a dotted key path
                    objAssignDeep(params.data, newValue, colDef.field);
                    return true; // value changed
                  },
                  valueGetter: params => {
                    const { colDef, data } = params;
                    return get(data, colDef.field);
                  }
                },
                currency: {
                  cellEditorParams: {
                    values: currencyOpts,
                    cellRendererFramework: CurrencyRender
                  },
                  cellEditor: "agRichSelectCellEditor",
                  cellRendererFramework: CurrencyRender
                },
                trueFalse: {
                  cellEditorParams: {
                    values: [true, false],
                    cellRendererFramework: CheckBoxRenderer
                  },
                  cellEditor: "agRichSelectCellEditor",
                  cellRendererFramework: CheckBoxRenderer
                },
                wrapText: {
                  wrapText: true,
                  autoHeight: true,
                  cellStyle: { lineHeight: "25px", wordBreak: "breakw-word" }
                },

                numeric: {
                  valueParser: numberParser,
                  valueFormatter: numberFormatter
                },

                countryFlagSelect: {
                  cellRendererFramework: CountryFlag,
                  cellEditor: "agRichSelectCellEditor",
                  cellEditorParams: {
                    values: countryOptions.map(({ code }) => code),
                    cellRendererFramework: CountryFlag
                  }
                },

                percentValue: {
                  cellRendererFramework: PercentCell
                },
                currencyValue: {
                  cellRendererFramework: CurrencyCell
                },
                ...columnTypes
              }}
              // eslint-disable-next-line lines-around-comment
              // pinnedTopRowData={getPinnedTopData()}
              // pinnedBottomRowData={getPinnedBottomData()}

              // code to automatically set the width of the cols to the bounding box:
              // onFirstDataRendered={params => {
              //   params.api.sizeColumnsToFit();
              // }}
              onGridReady={onGridReady}
              onFirstDataRendered={runOnFirstDataRendered}
              columnDefs={columnDefs}
              onCellValueChanged={onCellValueChanged}
              onPasteStart={onPasteStart}
              onPasteEnd={onPasteEnd}
              processCellForClipboard={({ value }) => {
                // grid can have either string || number || {formula, amount: {value, unit}}
                if (value.formula) return value.formula;
                if (value.amount && value.amount.value !== "") return value.amount?.value;
                return value;
              }}
              modules={[
                ClientSideRowModelModule,
                ServerSideRowModelModule,
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
              debug
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// function getPinnedTopData() {
//   return [
//     {
//       firstName: "##",
//       lastName: "##",
//       gender: "##",
//       address: "##",
//       mood: "##",
//       country: "##"
//     }
//   ];
// }
// function getPinnedBottomData() {
//   return [
//     {
//       firstName: "##",
//       lastName: "##",
//       gender: "##",
//       address: "##",
//       mood: "##",
//       country: "##"
//     }
//   ];
// }
// function getCharCodeFromEvent(event) {
//   event = event || window.event;
//   return typeof event.which === "undefined" ? event.keyCode : event.which;
// }
// function isCharNumeric(charStr) {
//   return !!/\d/.test(charStr);
// }
// function isKeyPressedNumeric(event) {
//   var charCode = getCharCodeFromEvent(event);
//   var charStr = String.fromCharCode(charCode);
//   return isCharNumeric(charStr);
// }

Grid.propTypes = {
  forwardRef: PropTypes.func,
  columnDefs: PropTypes.arrayOf(PropTypes.object),
  rowData: PropTypes.arrayOf(PropTypes.object),
  defaultColDef: PropTypes.object,
  columnTypes: PropTypes.object,
  staticStyle: PropTypes.object, // {background: "", color""}
  getContextMenuItems: PropTypes.func, // returns [] of contextmenuitems
  onGridReady: PropTypes.func,
  firstDataRendered: PropTypes.func,
  getRowNodeId: PropTypes.func,
  onSave: PropTypes.func,
  afterChange: PropTypes.func,
  isExternalFilterPresent: PropTypes.func,
  doesExternalFilterPass: PropTypes.func,
  context: PropTypes.object
};

export default Grid;
