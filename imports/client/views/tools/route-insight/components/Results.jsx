import React from "react";
import get from "lodash.get";
import { Trans } from "react-i18next";
import { Grid, Icon, Table } from "semantic-ui-react";
import { CurrencyTag, NumberTag } from "/imports/client/components/tags";
import StopsHorizontal from "/imports/client/components/utilities/StopsHorizontal.jsx";

const ICON_MAP = {
  road: "truck",
  sea: "anchor",
  air: "plane"
};

const MODES = ["air", "road", "sea"];

const ToolsCO2CalculatorResultDetail = ({ mode, results, currency }) => {
  const result = results[0];

  return result ? (
    <Grid columns={3} stackable divided="vertically">
      <Grid.Row stretched>
        <Grid.Column width={1}>
          <Icon name={ICON_MAP[mode]} />
        </Grid.Column>
        <Grid.Column width={8} textAlign="center">
          <StopsHorizontal stops={result.steps || []} />
        </Grid.Column>
        <Grid.Column width={7}>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Trans i18nKey="tools.routeInsights.distance" />
                </Table.Cell>
                <Table.Cell>
                  <NumberTag value={result.totalKm} digits={1} suffix="km" />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Trans i18nKey="tools.routeInsights.CO2" />
                </Table.Cell>
                <Table.Cell>
                  <NumberTag value={result.totalCO2} digits={1} suffix="kg" />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Trans i18nKey="tools.routeInsights.leadTime" />
                </Table.Cell>
                <Table.Cell>
                  <NumberTag value={result.totalLeadtime} digits={1} suffix="d" prefix="±" />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Trans i18nKey="tools.routeInsights.cost" />
                </Table.Cell>
                <Table.Cell>
                  <CurrencyTag value={result.totalCost} currency={currency} prefix="±" />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  ) : null;
};

const ToolsRouteInsightResult = ({ insight, currency }) => {
  const totalResultCount = MODES.reduce((acc, mode) => {
    return acc + (get(insight, [mode, "length"]) || 0);
  }, 0);

  return totalResultCount > 0 ? (
    MODES.map(mode => (
      <ToolsCO2CalculatorResultDetail
        key={mode}
        {...{ mode, results: insight[mode] || [], currency }}
      />
    ))
  ) : (
    <Trans i18nKey="tools.routeInsights.noResults" />
  );
};

export default ToolsRouteInsightResult;
