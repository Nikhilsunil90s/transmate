import React from "react";
import { Meteor } from "meteor/meteor";
import { oPath } from "/imports/utils/functions/path";

const ShipmentImportSummary = ({ job }) => {
  if (oPath(["result", "results", "_id"].job)) {
    const shipmentId = oPath(["result", "results", "_id"].job);
    const shipmentUrl = Meteor.absoluteUrl(`shipment/${shipmentId}`);
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
