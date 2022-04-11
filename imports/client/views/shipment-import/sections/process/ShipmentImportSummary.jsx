import React from "react";
import get from "lodash.get";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const ShipmentImportSummary = ({ job }) => {
  if (get(job, ["result", "results", "_id"])) {
    const shipmentId = get(job, ["result", "results", "_id"]);
    const shipmentUrl = generateRoutePath("shipment", { _id: shipmentId });
    return <a href={shipmentUrl}> Shipment id {shipmentId} </a>;
  }
  if (job.log) {
    const apiData = (job.log.find(el => el.message === "apiData") || {}).data;
    let data = "";
    if (!apiData) {
      data = "...still processing...";
    } else {
      data = (
        <a className="info" details={JSON.stringify(apiData, null, 2)}>
          {JSON.stringify(apiData).substring(0, 20)}
        </a>
      );
    }

    return data;
  }
  return null;
};

export default ShipmentImportSummary;
