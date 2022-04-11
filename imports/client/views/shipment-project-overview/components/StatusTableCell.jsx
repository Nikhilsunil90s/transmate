import React from "react";
import { string } from "prop-types";

const StatusTableCell = ({ status }) => {
  let indicatorColor;
  const lowerCasedStatus = status && status.toLowerCase();

  switch (true) {
    case lowerCasedStatus === "active":
      indicatorColor = "green";
      break;

    case lowerCasedStatus === "closed":
      indicatorColor = "red";
      break;

    default:
      indicatorColor = "red";
      break;
  }

  if (!status) {
    return null;
  }

  return (
    <div>
      <span
        style={{ position: "relative", top: "2px" }}
        className={`ui ${indicatorColor} empty horizontal circular label`}
      />
      {status}
    </div>
  );
};

StatusTableCell.propTypes = {
  status: string
};

export default StatusTableCell;
