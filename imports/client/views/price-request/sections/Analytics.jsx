/* eslint-disable no-use-before-define */
import React from "react";
import { toast } from "react-toastify";
import { useQuery } from "@apollo/client";
import { Segment, Grid } from "semantic-ui-react";
import { Trans } from "react-i18next";

import {
  AnalyticsDetail,
  PriceRequestHistoricChart,
  PriceRequestKPIChart,
  AnalyticsSummary
} from "../components";
import { AnalyticsData } from "../components/AnalyticsData";
import { GET_ANALYTIC_DATA } from "../utils/queries";

import { tabPropTypes } from "../tabs/_tabProptypes";

const PriceRequestAnalytics = ({ priceRequestId, priceRequest }) => {
  const { loading, error, data = {} } = useQuery(GET_ANALYTIC_DATA, {
    variables: { priceRequestId },
    fetchPolicy: "no-cache" // server updates data!
  });
  if (error) toast.error("could not get analytics");
  if (loading) return <Trans i18nKey="general.loading" />;

  const priceRequestWithInsights = { ...priceRequest, ...data.insights };

  return (
    <Segment padded="very" as="section" className="analytics">
      <h3 className="section-header">BID OVERVIEW</h3>
      {priceRequestWithInsights.calculation ? (
        <Grid>
          <Grid.Row columns={3}>
            <Grid.Column>
              <AnalyticsSummary priceRequest={priceRequestWithInsights} />
            </Grid.Column>
            <Grid.Column>
              <PriceRequestKPIChart priceRequest={priceRequestWithInsights} />
            </Grid.Column>
            <Grid.Column>
              <PriceRequestHistoricChart priceRequest={priceRequestWithInsights} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <AnalyticsDetail priceRequest={priceRequestWithInsights} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <AnalyticsData priceRequest={priceRequestWithInsights} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      ) : (
        <p>
          <Trans i18nKey="price.request.analytics.main.empty" />
        </p>
      )}
    </Segment>
  );
};

PriceRequestAnalytics.propTypes = tabPropTypes;

export default PriceRequestAnalytics;
