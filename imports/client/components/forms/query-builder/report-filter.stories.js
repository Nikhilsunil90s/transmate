import React from "react";
import { BuildFilter } from "/imports/client/components/forms/query-builder/reports-filter.jsx";

import PageHolder from "/imports/client/components/utilities/PageHolder";

const debug = require("debug")("reportfilter:storybook");

export default {
  title: "Components/report-filters"
};

// You need to provide your own config. See below 'Config format'
const demoConfig = {
  fields: {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0
      },
      valueSources: ["value"],
      preferWidgets: ["number"]
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      defaultValue: 10,
      fieldSettings: {
        min: 10,
        max: 100
      },
      preferWidgets: ["slider", "rangeslider"]
    },
    pickupDate: {
      label: "pickup date",
      type: "date",
      operators: ["greater", "less", "between"]
    },
    has_pricerequest: {
      label: "in price request?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"]
    }
  }
};

const setFilter = sqlString => {
  debug("sql string filter", sqlString);
};

// as part of a uniforms:
export const base = () => {
  const props = { ...demoConfig, output: "sql", setFilter };
  debug("start with props in base ", props);
  return (
    <PageHolder main="ReportFilter">
      <BuildFilter {...props} />
    </PageHolder>
  );
};
