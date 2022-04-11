/* eslint-disable consistent-return */
import { createWorkbook, saveFile } from "/imports/utils/UI/excelJsFn";

export { loadExcelJS } from "/imports/utils/UI/loadExternalScript";

const debug = require("debug")("reactTable:export");

// wrap loadExcelJS () in a useEffect function:

// https://codesandbox.io/s/github/gargroh/react-table-plugins/tree/master/examples/export-data

export function getExportFileBlob({ columns, data, fileName }) {
  const { ExcelJS } = window;
  if (!ExcelJS) return debug("ExcelJS script not loaded");
  const header = columns.map(c => c.exportValue);
  const compatibleData = data.map(row => {
    const obj = {};
    header.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });

  debug("export data", compatibleData, fileName);
  const wb = createWorkbook();
  const ws = wb.addWorksheet("export", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 1 }]
  });
  ws.columns = header.map(key => ({ header: key, key }));
  ws.addRows(compatibleData);
  debug(wb);
  saveFile({ wb });
}
