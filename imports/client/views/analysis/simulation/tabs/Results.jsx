import React, { useMemo } from "react";
import { Trans } from "react-i18next";
import {
  Segment,
  Header,
  Popup,
  Flag,
  Table,
  Button,
  Statistic,
  Grid,
  Icon
} from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";

import { currencyFormatter } from "/imports/client/components/tags/CurrencyTag.jsx";
import { percentFormat, leadTimeFormat } from "/imports/utils/UI/helpers";
import { DEFAULT_CURRENCY } from "/imports/api/_jsonSchemas/enums/costs";

const DEFAULT_UNIT = "pal";
const SHORT_CURRENCY = { notation: "compact", compactDisplay: "short" };

//#region components

const calculateSummaryTotal = ({ ...props }) => {
  const { aggregated = {}, simulation, currency } = props;

  const currentCost = aggregated.summary?.currentCost;
  const priceLists = simulation?.priceLists || [];
  const item = aggregated.priceList;
  const currencyFormat = val => currencyFormatter({ currency }).format(val || 0);

  // no currentCost given
  if (currentCost && currentCost !== 0 && item) {
    if (item.totalCost < currentCost) {
      const priceList = priceLists.find(({ id }) => id === item.id);
      const unit = simulation?.params?.uom || DEFAULT_UNIT;
      return {
        currentCost: currencyFormat(currentCost),
        saving: currencyFormat(aggregated.saving),
        percent: percentFormat(aggregated.percent),
        title: priceList != null ? priceList.title : undefined,
        popup: (
          <Trans
            i18nKey="analysis.simulation.table.item.info"
            values={{
              totalCost: currencyFormat(item.totalCost),
              avgShipCost: currencyFormat(item.avgCost),
              avgUnitCost: currencyFormat(item.avgUnitCost),
              unit,
              leadTime: leadTimeFormat(item.avgLeadTime),
              matches: percentFormat(item.matches)
            }}
          />
        )
      };
    }
    return {
      currentCost: currencyFormat(currentCost),
      saving: currencyFormat(0),
      percent: percentFormat(0),
      popup: <Trans i18nKey="analysis.simulation.total.noSaving" />
    };
  }

  return undefined;
};

const SavingsSummary = ({ ...props }) => {
  const total = useMemo(() => calculateSummaryTotal(props), []);

  return (
    <Segment basic floated="right" className="savings">
      {total ? (
        <>
          <div>
            <div className="ui left action input">
              <Button content={<Trans i18nKey="analysis.simulation.total.cost" />} />
              <input type="text" value={total.currentCost} readOnly />
            </div>
          </div>
          <div>
            <Popup
              title={total.title}
              content={<div style={{ whiteSpace: "pre-line" }}>{total.popup}</div>}
              trigger={
                <div className="ui left action input saving">
                  <Button
                    labeled
                    icon="angle down"
                    color="blue"
                    content={<Trans i18nKey="analysis.simulation.total.saving" />}
                  />
                  <input type="text" value={total.saving} readOnly />
                </div>
              }
            />
          </div>
          {total.percent && (
            <div>
              <strong>
                <Trans
                  i18nKey="analysis.simulation.total.percent"
                  values={{ percent: total.percent }}
                />
              </strong>
            </div>
          )}
        </>
      ) : (
        " - "
      )}
    </Segment>
  );
};

export const CheapestOverall = ({ priceLists = [], combi, currency }) => {
  const totalCombi = (combi || []).reduce(
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

  const getPriceListLabel = priceListId =>
    priceLists.find(({ id }) => id === priceListId)?.alias || priceListId;

  if (combi.length === 0) return null;
  return (
    <Grid fluid columns={2}>
      <Grid.Row>
        <Grid.Column verticalAlign="middle" width={4}>
          <Statistic
            label="Overall"
            value={currencyFormatter({ currency, options: SHORT_CURRENCY }).format(totalCombi.cost)}
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
                percentFormat(totalCount / totalCombi.shipCount),
                percentFormat(totalAmount / totalCombi.amount),
                currencyFormatter({ currency }).format(totalCost)
              ]
            })}
            tableData={combi}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const CheapestSingle = ({ priceLists = [], aggregated = {}, currency }) => {
  // first one with lowest costs and least amount of mismatches:
  const cheapest = (aggregated.priceLists || []).sort(
    (a, b) => b.matches - a.matches || a.totalCost - b.totalCost
  )?.[0];

  const getPriceListLabel = priceListId =>
    priceLists.find(({ id }) => id === priceListId)?.alias || priceListId;

  if (!cheapest) return null;
  return (
    <Grid fluid columns={2}>
      <Grid.Row>
        <Grid.Column verticalAlign="middle" width={4}>
          <Statistic
            label="Single"
            value={currencyFormatter({ currency, options: SHORT_CURRENCY }).format(
              cheapest.totalCost
            )}
          />
        </Grid.Column>
        <Grid.Column>
          <Table
            fluid
            headerRow={["", "", "% matches", "Cost"]}
            renderBodyRow={({ id: priceListId, totalCost, matches }, i) => ({
              key: `row-single-${i}`,
              warning: matches < 1,
              cells: [
                getPriceListLabel(priceListId),
                "",
                percentFormat(matches),
                currencyFormatter({ currency }).format(totalCost)
              ]
            })}
            tableData={[cheapest]}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

const TopLevelResult = ({ ...props }) => {
  const { aggregated, currency, priceLists } = props;

  const currencyFormat = val =>
    currencyFormatter({
      currency,
      options: SHORT_CURRENCY
    }).format(val || 0);

  function getValue(priceListId, topic) {
    const item = (aggregated?.priceLists || []).find(({ id }) => id === priceListId);
    const value = item ? item[topic.name] : undefined;
    if (topic.format === "currency") {
      return currencyFormat(value);
    }
    return percentFormat(value);
  }
  const columns = [
    { accessor: "name", Header: () => null },
    ...priceLists.map((pl, i) => ({
      id: `priceList-${i}`,
      Header: pl.alias,
      className: "noWrap",
      style: { maxWidth: "100px" },
      Cell: ({ row: { original: topic } }) => getValue(pl.id, topic)
    }))
  ];

  const data = [
    { name: "totalCost", format: "currency" },
    { name: "matches", format: "%" }
  ];

  return <ReactTable tableClass="ui definition table" columns={columns} data={data} />;
};

// aggregation script sets flags for cheapest and fastest and best overall
const LaneTable = ({ ...props }) => {
  const { aggrData, priceLists, currency, simulation } = props;
  const cc = aggrData.fromCC;

  const currencyFormat = val =>
    currencyFormatter({
      currency,
      options: { notation: "compact", compactDisplay: "short" }
    }).format(val || 0);
  const columns = [
    {
      id: "flag",
      Header: () => (
        <>
          <Flag name={cc.toLowerCase()} />
          <b>
            <Trans i18nKey="analysis.simulation.table.header.country" values={{ cc }} />
          </b>
        </>
      ),
      columns: [
        {
          Header: <Trans i18nKey="analysis.simulation.table.header.lane" />,
          accessor: "detail.name"
        },
        {
          Header: <Trans i18nKey="analysis.simulation.table.header.volume" />,
          accessor: "quantity.totalAmount"
        },
        {
          Header: <Trans i18nKey="analysis.simulation.table.header.shipmentCount" />,
          accessor: "quantity.shipCount"
        }
      ]
    },
    {
      id: "block",
      Header: () => null,
      columns: [
        {
          Header: <Trans i18nKey="analysis.simulation.table.header.averageCost" />,
          accessor: "quantity.currentCost",
          Cell: ({ value }) => currencyFormat(value)
        },
        {
          Header: <Trans i18nKey="analysis.simulation.table.header.savings" />,
          accessor: "total.savingsEur",
          Cell: ({ value }) => currencyFormat(value)
        },
        ...priceLists.map((pl, i) => ({
          id: `priceList-${i}`,
          Header: () => (
            <Popup
              title={pl.title}
              content={
                <Trans
                  i18nKey="analysis.simulation.table.header.list"
                  values={{ carrier: pl.carrierName }}
                />
              }
              trigger={<span>{pl.alias}</span>}
            />
          ),
          className: "noWrap",
          style: { maxWidth: "100px" },
          setStyle: rowInfo => {
            const cellProps = {};
            const itemData = (rowInfo.priceLists || []).find(({ id }) => id === pl.id);

            if (itemData.isBestOverall) {
              cellProps.className = "positive";
            }
            return cellProps;
          },
          Cell: ({ row: { original } }) => {
            const itemData = (original.priceLists || []).find(({ id }) => id === pl.id);

            return itemData ? (
              <Popup
                flowing
                header={pl.title}
                content={
                  itemData.totalCost !== 0 ? (
                    <Table
                      size="small"
                      renderBodyRow={(row, j) => ({
                        key: `popup-row-${j}`,
                        cells: [row.label, row.value]
                      })}
                      tableData={[
                        { label: "Title", value: pl.title },
                        { label: "Total cost", value: currencyFormat(itemData.totalCost) },
                        { label: "Avg. cost", value: currencyFormat(itemData.avgCost) },
                        { label: "Avg. unit cost", value: currencyFormat(itemData.avgUnitCost) },
                        { label: "unit", value: simulation.params.uom || DEFAULT_UNIT },
                        { label: "leadTime", value: leadTimeFormat(itemData.avgLeadTime) },
                        { label: "matches", value: percentFormat(itemData.matches) }
                      ]}
                    />
                  ) : (
                    <div style={{ whiteSpace: "pre-line" }}>
                      <Trans i18nKey="analysis.simulation.table.item.info" />
                    </div>
                  )
                }
                trigger={
                  <span>
                    {itemData.isCheapest && (
                      <sub>
                        <Icon name="thumbs up outline" color="blue" />
                      </sub>
                    )}
                    {itemData.isFastest && (
                      <sup>
                        <Icon name="clock" color="blue" />
                      </sup>
                    )}
                    {currencyFormat(itemData.totalCost)}
                    <sup>{itemData.avgLeadTime ? leadTimeFormat(itemData.avgLeadTime) : "-"}</sup>
                  </span>
                }
              />
            ) : (
              " - "
            );
          }
        }))
      ]
    }
  ];

  return (
    <ReactTable
      tableClass="ui table nowrap selectable"
      columns={columns}
      data={aggrData.lanes}
      getCellProps={cell => {
        if (typeof cell.column.setStyle === "function") {
          return cell.column.setStyle(cell.row.original);
        }
        return {};
      }}
    />
  );
};

export const LaneResult = ({ ...props }) => {
  const { priceLists, simulation, aggregated } = props;
  const aggregateGroup = aggregated || [];

  return (
    <>
      <Header as="h1" content={<Trans i18nKey="analysis.simulation.table.title" />} />
      {aggregateGroup.map((countryAggr, i) => (
        <LaneTable key={i} aggrData={countryAggr} priceLists={priceLists} simulation={simulation} />
      ))}
    </>
  );
};

const NoResultsPlaceholder = () => (
  <Segment padded="very">
    <p>
      <Trans i18nKey="analysis.simulation.nodata" />
    </p>
  </Segment>
);
//#endregion

const ResultsTab = ({ ...props }) => {
  const { simulation } = props;
  const currency = simulation?.definitions?.currency || DEFAULT_CURRENCY;
  const priceLists = (simulation?.priceLists || [])
    .map(item => {
      item.alias = item.alias || item.title;
      return item;
    })
    .sort((a, b) => a.alias.localeCompare(b.alias));

  const hasResultData = !!simulation?.aggregates;
  if (!hasResultData) return <NoResultsPlaceholder />;

  return (
    <>
      <Segment
        data-test="resultsSegment"
        className="resultsSegment"
        padded="very"
        clearing
        content={
          <>
            <SavingsSummary
              {...{ simulation, aggregated: simulation.aggregates?.summary, currency }}
            />
            <Header as="h1" content={<Trans i18nKey="analysis.simulation.table.title" />} />
          </>
        }
      />
      <Segment padded="very">
        <CheapestOverall {...{ priceLists, combi: simulation.aggregates?.combi || [], currency }} />
        <CheapestSingle
          {...{ priceLists, aggregated: simulation.aggregates?.topLevel, currency }}
        />
      </Segment>
      <Segment
        padded="very"
        attached
        content={
          <TopLevelResult
            {...{ simulation, aggregated: simulation.aggregates?.topLevel, priceLists, currency }}
          />
        }
      />
      <Segment
        padded="very"
        attached
        content={
          <LaneResult
            {...{ aggregated: simulation.aggregates?.byLanes, priceLists, simulation, currency }}
          />
        }
      />
    </>
  );
};

export default ResultsTab;
