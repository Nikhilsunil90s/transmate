import React from "react";
import { string } from "prop-types";

const StatusTag = ({ color, text }) => (
  <div>
    <span
      style={{ position: "relative", top: "2px" }}
      className={`ui ${color} empty horizontal circular label`}
    />
    {text}
  </div>
);

StatusTag.propTypes = {
  color: string,
  text: string
};

export default StatusTag;
