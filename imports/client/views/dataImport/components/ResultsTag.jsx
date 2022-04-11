import React from "react";

const DataImportResult = ({ job }) => {
  if (!job.result) return "";
  const { result } = job;
  switch (job.data.type) {
    case "partners":
      return (
        <a href={`/partner/${result.partnerId}`} target="blank">
          {result.name}
        </a>
      );
    case "address":
      return (
        <a href={`/location/${result.addressId}`} target="blank">
          {result.name}
        </a>
      );
    default:
      return "";
  }
};

export default DataImportResult;
