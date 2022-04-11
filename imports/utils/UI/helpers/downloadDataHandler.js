import { toast } from "react-toastify";
import jsonexport from "jsonexport/dist";

export const dataHandler = (r, toastId) => {
  jsonexport(r, (err2, csvData) => {
    let csvURL;
    if (err2) {
      return toast.error(err2.reason);
    }
    const csvDataBlob = new Blob([csvData], {
      type: "text/csv;charset=utf-8;"
    });
    if (navigator.msSaveBlob) {
      csvURL = navigator.msSaveBlob(csvDataBlob, "download.csv");
    } else {
      csvURL = window.URL.createObjectURL(csvDataBlob);
    }
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    return tempLink.click();
  });

  if (toastId) {
    toast.dismiss(toastId);
  }
  return toast.success("report generated");
};
