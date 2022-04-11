import React from "react";
import { Popup } from "semantic-ui-react";

const DataImportStatus = ({ job }) => {
  switch (job.status) {
    case "running":
      return "importing...";
    case "completed":
      return "imported";
    case "cancelled":
      return "cancelled";
    case "failed": {
      // get last 3 log entries level danger
      let warnings = [];
      if (job.log && Array.isArray(job.log)) {
        warnings = job.log.filter(log => log.level === "danger").slice(-3);
        warnings = warnings.map(logDetails => {
          return `${logDetails.message}:${(logDetails.data || {}).message || ""}`;
        });
      }
      return (
        <Popup
          style={{ color: "red" }}
          content={warnings.join(" \r\n")}
          trigger={
            <span className="error" details={warnings.join(" \r\n")} style={{ color: "red" }}>
              ERROR:check log details!
            </span>
          }
        />
      );
    }

    default:
      return "queued for import";
  }
};

export default DataImportStatus;
