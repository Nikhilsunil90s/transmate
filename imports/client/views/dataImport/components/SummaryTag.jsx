import React from "react";
import { Popup } from "semantic-ui-react";

const DataImportSummary = ({ value }) => {
  return (
    <Popup
      content={JSON.stringify(value, null, 2)}
      trigger={<span className="info">{JSON.stringify(value).substring(0, 20)}</span>}
    />
  );
};

export default DataImportSummary;
