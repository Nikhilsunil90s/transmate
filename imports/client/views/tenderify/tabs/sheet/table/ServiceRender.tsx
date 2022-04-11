import React from "react";
import { Icon } from "semantic-ui-react";
import { ICellRendererParams } from "@ag-grid-community/core";

const SERVICE_MAP = {
  port: "anchor",
  yard: "boxes",
  door: "warehouse"
};

const ServiceRenderer = ({ value }: ICellRendererParams) => {
  if (value && SERVICE_MAP[value])
    return (
      <span>
        <Icon name={SERVICE_MAP[value]} color="grey" />
        {value}
      </span>
    );
  return value || null;
};

export default ServiceRenderer;
