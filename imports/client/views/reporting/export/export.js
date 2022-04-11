import ExportData from "./Export.jsx";
import "./export.html";

Template.DataExport.helpers({
  getComponent() {
    return { component: ExportData, topic: "priceRequest" };
  }
});
