/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable prettier/prettier */
import React from "react";

import { PriceListComp } from "../../../utils/priceList/grid__class_comp";
import { DataSheetCore } from "./DataSheetCore";

// is this used?
export class PriceListSheet extends React.Component {
  priceListComp = null;

  constructor(props) {
    super(props);
    const { priceList, onSave, vendor, activeFilters, accessControl, callback, mock } = props;

    this.priceListComp = new PriceListComp({
      doc: priceList,
      onSaveAction: onSave,
      accessControl,
      mock
    }); // initialize the table

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
      columnDefs: []
    };
  }

  async freshData(refresh = false) {
    const { priceList, onSave, vendor, activeFilters, accessControl, callback } = this.props;

    const oldStructure = {
      rowHeaders: this.priceListComp.getHeaders("rows"),
      colHeaders: this.priceListComp.getHeaders("cols"),
      columns: this.priceListComp.getColumns(true),
      data: this.priceListComp.initializeData()
    };

    if (refresh) {
      const { filters, empty } = await this.priceListComp.refresh(
        { doc: priceList, vendor, activeFilters, accessControl },
        callback
      );
      oldStructure.data = this.priceListComp.data;
    }

    const structure = this.convertDataStructure(oldStructure);

    this.setState({ ...structure });
  }

  async componentDidMount() {
    await this.freshData(true);
  }

  convertDataStructure({ rowHeaders, colHeaders, columns: oldColumns, data: oldData }) {
    const rowData = [];
    const pinRowData = [{ "0": rowHeaders[0] }];
    const columns = [{ headerName: "", field: "0", editable: false }];
    const structure = {
      pinnedTopRowData: pinRowData,
      rowData,
      columnDefs: columns
    };

    // first line is pinned
    const firstRow = oldData.shift();
    colHeaders.map((c, index) => {
      const colIndexStr = `${index + 1}`;
      const nc = { headerName: c, field: colIndexStr };
      columns.push(nc);
      pinRowData[0][colIndexStr] = firstRow[index];
      return nc;
    });

    // const widthStr = `${columns.length ? 100 / columns.length : 100}%`;
    // columns.map(c => {
    //     c.width = widthStr;
    //     return null;
    // });

    // [
    //     { value: "Ordinary Bitter", readOnly: true },
    //     { value: "20 - 35" },
    //     { value: "5 - 12" },
    //     { value: 4, dataEditor: RangeEditor }
    //   ],

    oldData.map((r, i) => {
      const nr = { "0": rowHeaders[i + 1] };
      r.map((c, j) => {
        const colIndexStr = `${j + 1}`;
        nr[colIndexStr] = c;
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
        pinnedTopRowData={this.state.pinnedTopRowData}
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}
      />
    );
  }
}
