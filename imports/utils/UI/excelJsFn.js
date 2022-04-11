/* global ExcelJS */
import { saveAs } from "file-saver";

export const saveFile = ({ wb, fileName = "export.xlsx" }) => {
  // call with this = exportClass;
  wb.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, fileName);
  });
};

export const createWorkbook = () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Transmate";
  wb.created = new Date();
  wb.modified = new Date();

  return wb;
};
