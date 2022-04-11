import React from "react";
import { Grid, Statistic, Table } from "semantic-ui-react";
import { currencyFormatter } from "/imports/client/components/tags/CurrencyTag.jsx";
import { percentFormat } from "/imports/utils/UI/helpers";

const SHORT_CURRENCY = { notation: "compact", compactDisplay: "short" };

export const ScenarioStatistic = ({ label, priceLists = [], detail = {}, currency }) => {
  const totals = (detail.allocation || []).reduce(
    (acc, cur) => {
      return {
        cost: acc.cost + (cur.totalCost || 0),
        amount: acc.amount + (cur.totalAmount || 0),
        shipCount: acc.shipCount + (cur.totalCount || 0),
        groups: acc.groups + (cur.groupCount || 0)
      };
    },
    { cost: 0, amount: 0, shipCount: 0, groups: 0 }
  );

  const getPriceListLabel = priceListId => {
    const info = priceLists.find(({ id }) => id === priceListId);
    return info.alias || info.carrierName || priceListId;
  };
  if (!detail) return "no calculation found";
  return (
    <Grid fluid columns={2}>
      <Grid.Row>
        <Grid.Column verticalAlign="middle" width={4}>
          <Statistic
            label={label}
            value={currencyFormatter({ currency, options: SHORT_CURRENCY }).format(totals.cost)}
          />
        </Grid.Column>
        <Grid.Column>
          <Table
            headerRow={["", "% shipments", "% volume", "Cost"]}
            renderBodyRow={({ priceListId, totalCost, totalCount, totalAmount }, i) => ({
              key: `row-${i}`,
              warning: priceListId === "noBid",
              cells: [
                getPriceListLabel(priceListId),
                percentFormat(totalCount / totals.shipCount),
                percentFormat(totalAmount / totals.amount),
                currencyFormatter({ currency }).format(totalCost)
              ]
            })}
            tableData={detail.allocation}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default ScenarioStatistic;
