import { PriceListUICore } from "./grid__class_core";
import { getGridData } from "/imports/utils/priceList/grid_getData";

class PriceListExportGenerator extends PriceListUICore {
  // lightWeight priceListCore mod that will build the structure & data & makes it available
  constructor(doc, activeFilters, cellData) {
    super(doc);
    this.initializePageFilters(activeFilters);
    this.initializeData();
    const { data } = getGridData.apply(this, [cellData]);
    this.data = data;
    return this;
  }

  get() {
    // gridCols[0] & gridRows[0] need to be added in the base
    // alternatively we can use gridJs helper?
    // result needs to be [ []...]
    const tabName = this.pageFilters
      .map(({ label }) => label)
      .join("|")
      .replace(/\\|\/|\?|\*|\[|\]/g, "");

    // add header Rows:
    const gridcols = this.gridcols[0].map(el => el.label || "");
    const gridrows = this.gridrows[0].map(el => el.label || "");
    gridrows.unshift(null); // we add a null cell as column is first row

    // we modify the data [[ ]] to add col & row labels
    this.data.unshift(gridcols); // add column labels
    this.data.forEach((row, i) => {
      row.unshift(gridrows[i]); // add row labels
    });

    // add an empty row & column
    let colCount = this.data[0].length;
    this.data.unshift(new Array(colCount).fill(null)); // add empty row
    this.data.forEach(row => {
      row.unshift(null); // add empty column
    });

    // colFormatting
    colCount = this.data[0].length;
    const colStyles = new Array(colCount).fill({ width: 14 });
    colStyles[0] = { width: 1 };
    colStyles[1] = { width: 20 };

    // rowFormatting
    const rowCount = this.data.length;
    const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
    rowStyles[0] = { hpt: 5.4, hpx: 5.4 };

    const merges = [];

    return {
      tabName: `Rates - ${tabName}`,
      sheetData: this.data,
      colStyles,
      rowStyles,
      merges
    };
  }
}

export { PriceListExportGenerator };
