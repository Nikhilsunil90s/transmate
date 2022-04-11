import { saveAs } from "file-saver";

// eslint-disable-next-line func-names
export const saveFile = function({ fileName = "export.xlsx" }) {
  // call with this = exportClass;
  this.wb.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, fileName);
  });
};
