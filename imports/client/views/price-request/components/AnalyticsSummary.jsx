import React from "react";
import { Trans } from "react-i18next";
import { Table } from "semantic-ui-react";
import get from "lodash.get";

import { currencyFormat, leadTimeDays } from "/imports/utils/UI/helpers";

const renderBodyRow = ({ key, value }) => ({
  key: `row-${key}`,
  cells: [
    {
      key: `${key}-label`,
      content: <Trans i18nKey={`price.request.analytics.summary.${key}`} />
    },
    {
      key: `${key}-value`,
      content: value
    }
  ]
});

const PriceRequestAnalyticsSummary = ({ priceRequest = {} }) => {
  const summary = get(priceRequest, ["calculation", "summary"], {});
  const data = [
    {
      key: "acceptance",
      value: `${get(summary, "totalSubmitted", 0)} of ${get(summary, "totalRequested", 0)}`
    },
    {
      key: "minCost",
      value: currencyFormat(get(summary, ["bestCost", "totalCost"], 0), priceRequest.currency)
    },
    {
      key: "minLeadTime",
      value: `${leadTimeDays(get(summary, ["bestLeadTime", "leadTime"], 0))} d`
    }
  ];

  return <Table renderBodyRow={renderBodyRow} tableData={data} />;
};

export default PriceRequestAnalyticsSummary;
