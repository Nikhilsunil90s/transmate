/* eslint-disable no-use-before-define */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef, useState } from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { PriceListComp } from "../grid__class_comp";

import { gridRoadData, gridRoadDataRates } from "./gridDataRoad";
import { gridOceanData, gridOceanDataRates } from "./gridDataOcean";
import { gridOceanDataList, gridOceanDataListRates } from "./gridDataOceanList";
import { gridAirData } from "./gridDataAir";
import { security } from "./securityData";
import { gridDataEmpty } from "./gridDataEmpty";

// grid class helper function
import { getGridData } from "../grid_getData";
import { PriceListGridSheet } from "../../../client/components/datasheet/PriceListGridSheet";

export default {
  title: "Components/tables/rateGrid"
};

/**
 * notes:
 * current: used class grid_class_UI.js that extends grid_class_data.js
 * there are 3 main steps:
 *    - constructor() initialize the class that builds the structure
 *    - initializeTable() render initial table with [[null...]] array of arrays
 *    - refresh() refreshes data on change, gets db data and sets access rights
 *
 * How we want to use the classes in a page:
 * 1. Grid will be loaded in page where data context {priceList: {}} is known
 * 2. When rendering the grid, the structure gets initialized first using the priceList context:
 * 2.1 initialize the grid_UI with {priceList, security}
 *      - template info is retrieved and stored in this.templInfo
 *      - pageFilters are intialized (build all options and use case 0 to start building)
 *      - rate structure is being generated resulting in:
 *            - gridRowsKeys & gridColsKeys as [[],[],..] holding the data keys for row/cell
 *            - gridRows & gridCols as [[],[],..] holding the complete column element
 * 2.2 on the class, the initializeTable() is called:
 * 2.3 on the class, the refresh() is called with params {doc, vendor, activeFilters, security, callback}
 *      - class will re-evaluate the data structure and will use the activeFilters to know how to render the grid
 *      - getData() function will call the method with the filters and map everything in grid: [[],[],..]
 *
 * class components:
 * base: [[],[],..] ,headerData || databaseDoc for cell
 * data: [[],[],..] displayed data grid (only holds values)
 * gridCols, gridRows: [[{}],..] column keys & data
 * gridColsKeys, gridRowsKesy: [[{}],..] column keys (only the keys)
 *  */

// helper to get the data in directly:
function cellMockDataLoader(cellData = []) {
  // real method returns as: { data: [], stats: {} }
  const methodResult = { rates: cellData, stats: {} };

  // set the data to the 'base':
  getGridData.apply(this, [methodResult]);
}

const onSaveAction = (...args) => {
  console.log("onSave", ...args);
};

/** should render:
 * - horizontal axis (=range names),
 * - vertical axis (=lane names)
 * - first row: dropdowns for multiplier
 * */
export const gridRoadStructureNoData = () => {
  const doc = { ...gridRoadData };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, []);
  console.log(".....>>>>>>", grid);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};

export const gridRoadStructureWithData = () => {
  const doc = { ...gridRoadData };
  console.log("ddd");
  const grid = useRef(new PriceListComp({ doc, onSaveAction, security }));
  const [refresh, setRefresh] = useState(false);

  useState(() => {
    console.log("111");
    grid.current.refresh({ doc, onSaveAction, security });
    cellMockDataLoader.call(grid.current, gridRoadDataRates);
    console.log("222");
    setRefresh(true);

    // console.log(grid);
  });

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        refresh={refresh}
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid.current}
      />
    </PageHolder>
  );
};

export const gridRoadEmpty = () => {
  const doc = { ...gridDataEmpty, template: { type: "road" } };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, []);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid}
      />
    </PageHolder>
  );
};

/** should render:
 * - horizontal axis: equipment group
 * - vertical axis: charges
 * - [Filters] -> lanes
 * - first column: dropdown for currency
 */
export const gridOceanStructureNoData = () => {
  const doc = { ...gridOceanData };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, []);
  console.log("====", grid);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};

export const gridOceanStructureWithData = () => {
  const doc = { ...gridOceanData };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, gridOceanDataRates);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};

export const gridOceanStructureWithChargeSettingCurrency = () => {
  const { charges, ...doc } = { ...gridOceanData };
  doc.charges = charges.map(({ currency, ...rest }) => ({
    ...rest,
    currency: "USD"
  }));
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, gridOceanDataRates);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};

export const gridOceanStructureWithDataSettingCurrency = () => {
  const doc = { ...gridOceanData };
  const gridOceandDataRatesMod = gridOceanDataRates.map(
    ({ amount: { value }, ...rest }) => ({
      ...rest,
      amount: { value, unit: "USD" }
    })
  );
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, gridOceandDataRatesMod);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};

export const gridOceanEmpty = () => {
  const doc = { ...gridDataEmpty, template: { type: "ocean" } };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, []);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid}
      />
    </PageHolder>
  );
};

/** should render:
 * - horizontal axis: meta.leg, charge, range, min&max, currency, multiplier
 * - vertical axis: Lanes
 * - [Filters] -> volumeGroup
 * - first 5 rows are header rows
 */
export const gridAirStructureNoData = () => {
  const doc = { ...gridAirData };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, []);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid}
      />
    </PageHolder>
  );
};

/** should render:
 * - horizontal axis: meta.leg, charge, multiplier
 * - vertical axis: Lanes, meta data of lane, equipment
 * - first rows are header rows
 */
export const gridOceanList = () => {
  const doc = { ...gridOceanDataList };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid, gridOceanDataListRates, []);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid}
      />
    </PageHolder>
  );
};

export const gridOceanListEmpty = () => {
  const doc = {
    ...gridDataEmpty,
    template: { type: "oceanList" },
    charges: [
      {
        id: "LmJcXaLxXY29xb9mm",
        name: "test charge",
        type: "calculated",
        costId: "o6fLThAWhaWW3uDaj",
        currency: "EUR",
        multiplier: "pal"
      }
    ]
  };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  grid.refresh({ doc, onSaveAction, security });
  cellMockDataLoader.call(grid);
  console.log(grid);

  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet
        onSave={onSaveAction}
        style={{ height: 300 }}
        priceListComp={grid}
      />
    </PageHolder>
  );
};

export const gridEmpty = () => {
  const doc = { ...gridRoadData, _id: "empty", lanes: [], volumes: [] };
  const grid = new PriceListComp({ doc, onSaveAction, security });
  return (
    <PageHolder main="PriceList">
      <PriceListGridSheet style={{ height: 300 }} priceListComp={grid} />
    </PageHolder>
  );
};
