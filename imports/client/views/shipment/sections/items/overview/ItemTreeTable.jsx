/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-duplicates */
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import get from "lodash.get";
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
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";

// import styles;
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";

import { LicenseManager } from "@ag-grid-enterprise/core";

import { Button, Modal } from "semantic-ui-react";
import { Trans } from "react-i18next";
import { DescQuantityCellRender } from "./DescQuantityCellRender";
import { QuantityCellRender } from "./QuantityCellRender";
import { WeightCellRender } from "./WeightCellRender";
import { ConditionCellRender } from "./ConditionCellRender";
import { DGCellRender } from "./DGCellRender";
import { ActionsRenderer } from "./ActionsRenderer";
import { TaxableRenderer } from "./TaxableRenderer";

LicenseManager.setLicenseKey(Meteor.settings.public.AG_GRID);

const debug = require("debug")("itemTreeTable");

const rootEl = document.getElementById("react-root");
const ROOT_ID = "Root";

let potentialParent = null;

function isSelectionParentOfTarget(selectedNode, targetNode) {
  const children = selectedNode.childrenAfterGroup;
  for (let i = 0; i < children.length; i++) {
    if (targetNode && children[i].key === targetNode.key) return true;
    isSelectionParentOfTarget(children[i], targetNode);
  }
  return false;
}
function arePathsEqual(path1, path2) {
  if (path1.length !== path2.length) {
    return false;
  }
  let equal = true;
  path1.forEach((item, index) => {
    if (path2[index] !== item) {
      equal = false;
    }
  });
  return equal;
}
function refreshRows(api, rowsToRefresh) {
  const params = {
    rowNodes: rowsToRefresh,
    force: true
  };
  api.refreshCells(params);
}
function setPotentialParentForNode(api, overNode) {
  let newPotentialParent;
  if (overNode) {
    newPotentialParent = overNode;
  } else {
    newPotentialParent = null;
  }
  const alreadySelected = potentialParent === newPotentialParent;
  if (alreadySelected) {
    return;
  }
  const rowsToRefresh = [];
  if (potentialParent) {
    rowsToRefresh.push(potentialParent);
  }
  if (newPotentialParent) {
    rowsToRefresh.push(newPotentialParent);
  }
  potentialParent = newPotentialParent;
  refreshRows(api, rowsToRefresh);
}

function getFileCellRenderer(shipment = {}) {
  function FileCellRenderer() {}
  FileCellRenderer.prototype.init = function funcInit(params) {
    const tempDiv = document.createElement("div");
    const { value, data } = params;
    const icon = data.type === "TU" ? "cube" : "box";
    const rootText = `shipment ${get(shipment, "references.number", shipment.number)}`;
    const html =
      value !== ROOT_ID
        ? // eslint-disable-next-line no-useless-concat
          `<span><i class="icon ${icon}" style="width:100%"></i></span>`
        : rootText;
    tempDiv.innerHTML = html;

    this.eGui = tempDiv.firstChild;
  };
  FileCellRenderer.prototype.getGui = function getGui() {
    return this.eGui;
  };
  return FileCellRenderer;
}

function findParent(arr, item) {
  return arr.find(({ id }) => id === item.parentItemId);
}

function buildItemTreePath(arr, item) {
  const path = [item.id];

  let cur = item;
  do {
    const parent = findParent(arr, cur);
    if (parent) {
      path.push(parent.id);
    }
    cur = parent;
  } while (cur);
  path.reverse();
  path.unshift(ROOT_ID);

  return path;
}

function convertStructure({ data }) {
  const rowData = data.map(item => {
    return { ...item, treePath: buildItemTreePath(data, item) };
  });

  rowData.unshift({ id: ROOT_ID, treePath: [ROOT_ID] });
  return {
    rowData
  };
}

const hoverCssRule = params => {
  return params.node === potentialParent;
};

const clickableRule = params => {
  return params.data.id !== ROOT_ID;
};

export class ItemTreeTable extends Component {
  onChangeParentNodeParams = null;

  onDeleteParams = null;

  frameworkComponents = {
    descQuantityCellRender: DescQuantityCellRender,
    QuantityCellRender,
    WeightCellRender,
    ConditionCellRender,
    DGCellRender,
    ActionsRenderer,
    TaxableRenderer
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      action: "",

      rowData: [],
      defaultColDef: {
        flex: 1,
        resizable: true
      },
      components: {
        fileCellRenderer: getFileCellRenderer(this.props.shipment)
      },
      groupDefaultExpanded: -1,
      getDataPath(data) {
        return data.treePath;
      },
      getRowNodeId(data) {
        return data.id;
      },
      autoGroupColumnDef: {
        rowDrag(params) {
          // controls if a row can be dragged
          const { canDrag } = props;

          const { data: rowItemData } = params;
          if (!rowItemData) {
            return false;
          }

          // only allow non-groups to be dragged
          return canDrag && rowItemData.id !== ROOT_ID;
        },
        headerName: "TYPE",
        minWidth: 200,
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: "fileCellRenderer"
        },
        cellClassRules: {
          clickable: clickableRule,
          "hover-over": hoverCssRule
        }
      }
    };
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // depreciated this.gridApi.showToolPanel(false);
  };

  onAction = ({ data, action }) => {
    if (action === "delete") {
      this.setState({
        open: true,
        msg: <Trans i18nKey="shipment.form.itemNew.confirm.delete" />,
        action: "delete"
      });
      this.onDeleteParams = { id: data.id };
    }
  };

  handleRowClick = params => {
    const { data, node, colDef } = params;
    if (data.id === ROOT_ID) {
      return;
    }
    const { rowIndex } = node;
    const { field } = colDef;

    // action column should not trigger other event
    if (field === "action") {
      return;
    }
    const { onRowClick } = this.props;
    // eslint-disable-next-line no-unused-expressions
    onRowClick && onRowClick(data);
  };

  onRowDragMove = event => {
    // debug('---onRowDragMove', event);
    setPotentialParentForNode(event.api, event.overNode);
  };

  onRowDragLeave = event => {
    // setPotentialParentForNode(event.api, null);
  };

  onRowDragEnd = event => {
    const { canEditItems } = this.props;
    if (!canEditItems) {
      return;
    }
    if (!potentialParent) {
      return;
    }

    const newParentPath = potentialParent.data ? potentialParent.data.treePath : [];
    const movingData = event.node.data;

    // when move to self
    if (movingData === potentialParent.data) {
      return;
    }
    const { treePath: movingPath } = movingData;

    const movingNodeParentPath = [...movingPath].splice(-2, 1);
    const parentNodePath = [...newParentPath].splice(-1);

    // debug('---onRowDragEnd', parentNodePath, movingNodeParentPath, event);

    // const needToChangeParent = !arePathsEqual(newParentPath, movingData.treePath);
    const needToChangeParent = !arePathsEqual(parentNodePath, movingNodeParentPath);
    const invalidMode = isSelectionParentOfTarget(event.node, potentialParent);
    if (invalidMode) {
      debug("invalid move");
    }
    if (needToChangeParent && !invalidMode) {
      debug("go to here", newParentPath);
      this.onChangeParentNodeParams = {
        node: movingData,
        targetParent: parentNodePath[0] === ROOT_ID ? null : potentialParent.data
      };
      const { id } = potentialParent.data;
      const msg =
        id === ROOT_ID ? (
          <Trans i18nKey="shipment.form.itemNew.confirm.toRoot" />
        ) : (
          <Trans i18nKey="shipment.form.itemNew.confirm.toItem" values={{ value: id }} />
        );
      this.setState({ open: true, msg, action: "drag" });
      debug("modal should open");

      // const updatedRows = [];
      // moveToPath(newParentPath, event.node, updatedRows);
      // this.gridApi.applyTransaction({ update: updatedRows });
      // this.gridApi.clearFocusedCell();
    }

    // setPotentialParentForNode(event.api, null);
  };

  // eslint-disable-next-line class-methods-use-this
  getMainMenuItems() {
    return ["expandAll", "contractAll"];
  }

  close = () => {
    this.setState({ open: false });
  };

  closeAction = yes => {
    const { action } = this.state;

    if (!yes) {
      this.setState({ open: false, action: null });
      return;
    }

    if (action === "drag") {
      const { onChangeParentNode } = this.props;
      // eslint-disable-next-line no-unused-expressions
      onChangeParentNode && onChangeParentNode(this.onChangeParentNodeParams);
    } else if (action === "delete") {
      const { onDelete } = this.props;
      // eslint-disable-next-line no-unused-expressions
      onDelete && onDelete(this.onDeleteParams);
    }
    this.setState({ open: false, action: null });
  };

  buildColDefs() {
    const { canEditItems, data } = this.props;

    const columnDefs = [
      {
        headerName: "Description",
        headerTooltip: "Description || Type",
        cellClassRules: {
          clickable: clickableRule,
          "hover-over": hoverCssRule
        },
        cellRenderer: "descQuantityCellRender"
      },
      {
        headerName: "Quantity",
        headerTooltip: "Quantity",
        cellClassRules: {
          clickable: clickableRule,
          "hover-over": hoverCssRule
        },
        cellRenderer: "QuantityCellRender"
      },
      {
        headerName: "Weight",
        headerTooltip: "Weight",
        minWidth: 120,
        cellClassRules: {
          cellClassRules: {
            clickable: clickableRule,
            "hover-over": hoverCssRule
          }
        },
        cellRenderer: "WeightCellRender"
      },
      {
        headerName: "Cond.",
        headerTooltip: "Condition",
        cellClassRules: {
          clickable: clickableRule,
          "hover-over": hoverCssRule
        },
        cellRenderer: "ConditionCellRender"
      },
      {
        headerName: "DG",
        headerTooltip: "Dangerous Good",
        cellRenderer: "DGCellRender",
        cellClassRules: {
          clickable: clickableRule,
          "hover-over": hoverCssRule
        }
      }
    ];

    // keys
    const keyset = {};
    data.forEach(({ taxable }) => {
      if (!taxable) {
        return;
      }
      taxable.forEach(({ type }) => {
        if (keyset[type]) {
          return;
        }
        keyset[type] = true;
      });
    });
    Object.keys(keyset).forEach(taxableType => {
      columnDefs.push({
        headerName: taxableType,
        cellRenderer: "TaxableRenderer",
        cellRendererParams: {
          taxableType
        },
        cellClassRules: {
          clickable: false,
          "hover-over": hoverCssRule
        }
      });
    });

    if (canEditItems) {
      columnDefs.push({
        field: "action",
        headerName: "",
        cellRenderer: "ActionsRenderer",
        cellRendererParams: {
          onAction: this.onAction
        },
        cellClassRules: {
          clickable: false,
          "hover-over": hoverCssRule
        }
      });
    }

    return columnDefs;
  }

  renderAlert() {
    return (
      <Modal dimmer size="small" open onClose={this.close} mountNode={rootEl}>
        <Modal.Header>
          <Trans i18nKey="shipment.form.itemNew.confirm.title" />
        </Modal.Header>
        <Modal.Content>
          <p>{this.state.msg}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              this.closeAction(false);
            }}
          >
            <Trans i18nKey="form.cancel" />
          </Button>
          <Button
            primary
            onClick={() => this.closeAction(true)}
            content={<Trans i18nKey="form.save" />}
          />
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    const { data, style = {} } = this.props;
    const { rowData } = convertStructure({ data });
    const { open } = this.state;
    const columnDefs = this.buildColDefs();

    return (
      <div className="item-tree-table" style={{ ...style, width: "100%", height: "100%" }}>
        {open ? this.renderAlert() : null}
        <div
          style={{
            height: "100%",
            width: "100%"
          }}
          className="ag-theme-balham"
        >
          <AgGridReact
            sideBar={false}
            toolPanelSuppressSideButtons
            getMainMenuItems={this.getMainMenuItems}
            onCellClicked={this.handleRowClick}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={this.state.defaultColDef}
            components={this.state.components}
            frameworkComponents={this.frameworkComponents}
            treeData
            animateRows
            groupDefaultExpanded={this.state.groupDefaultExpanded}
            getDataPath={this.state.getDataPath}
            getRowNodeId={this.state.getRowNodeId}
            autoGroupColumnDef={this.state.autoGroupColumnDef}
            onGridReady={this.onGridReady}
            onRowDragMove={this.onRowDragMove.bind(this)}
            onRowDragLeave={this.onRowDragLeave.bind(this)}
            onRowDragEnd={this.onRowDragEnd.bind(this)}
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
              SideBarModule,
              RowGroupingModule
            ]}
          />
        </div>
      </div>
    );
  }
}
