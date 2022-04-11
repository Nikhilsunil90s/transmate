import React from "react";
import PageHolder from "../utilities/PageHolder";
import { DataSheetCore } from "./DataSheetCore";
import { AgGridExample } from "./AgGridExample";
import mockDatasheetcore from "./mock.datasheetcore.json";

const debug = require("debug")("datasheet:stories");

export default {
  title: "Components/tables/DataSheet"
};

export const basic = () => (
  <PageHolder main="AccountPortal">
    <AgGridExample />
  </PageHolder>
);

export const dataSheetCore = () => (
  <PageHolder main="PriceList">
    <DataSheetCore
      style={{ width: "100%", height: "500px" }}
      {...mockDatasheetcore}
      onChange={debug}
    />
  </PageHolder>
);
