import { useQuery } from "@apollo/client";
import React from "react";
import { Grid, Segment } from "semantic-ui-react";

import {
  HelpArticles,
  Tools,
  Tasks,
  DataCard,
  Profile,
  ShipmentStats,
  LocationStats
} from "./components";
import { GET_DASHBOARD_DATA } from "./utils/queries";

const debug = require("debug")("dashboard");

const CARD_PROPS = {
  priceLists: {
    title: "dashboard.card.priceLists.title",
    icon: "icon-layers",
    metaText: "dashboard.card.priceLists.info",
    urlOverview: "/price-lists"
  },
  priceRequests: {
    title: "dashboard.card.priceRequests.title",
    icon: "gavel icon",
    metaText: "dashboard.card.priceRequests.info",
    urlOverview: "/price-requests"
  },
  shipments: {
    title: "dashboard.card.shipments.title",
    icon: "icon-compass",
    metaText: "dashboard.card.shipments.info",
    urlOverview: "/shipments"
  },
  invoices: {
    title: "dashboard.card.invoices.title",
    icon: "icon-docs",
    metaText: "dashboard.card.invoices.info",
    urlOverview: "/partners"
  },
  tenders: {
    title: "dashboard.card.tenders.title",
    icon: "icon-badge",
    metaText: "dashboard.card.tenders.info",
    urlOverview: "/tenders"
  }
};

const Dashboard = () => {
  const { data = {}, loading, error } = useQuery(GET_DASHBOARD_DATA);
  debug("dashboard data %o", { data, loading, error });
  if (error) console.error({ error });
  return (
    <div id="limit">
      <Segment basic padded="very" as="section">
        <Grid columns={4} stackable>
          <Grid.Row stretched>
            <Grid.Column>
              <Tasks />
            </Grid.Column>
            <Grid.Column>
              <DataCard {...CARD_PROPS.priceRequests} count={data.stats?.priceRequestCount} />
              <DataCard {...CARD_PROPS.priceLists} count={data.stats?.priceListCount} />
            </Grid.Column>
            <Grid.Column>
              <DataCard {...CARD_PROPS.tenders} count={data.stats?.tenderCount} />
              <DataCard {...CARD_PROPS.invoices} count={data.stats?.invoiceCount} />
            </Grid.Column>
            <Grid.Column>
              <Tools />
              <HelpArticles />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Profile />
        <Grid columns={2} stackable>
          <Grid.Column>
            <ShipmentStats loading={loading} counts={data.stats?.shipmentCount || {}} />
          </Grid.Column>
          <Grid.Column>
            <LocationStats loading={loading} locations={data.stats?.addressLocations || []} />
          </Grid.Column>
        </Grid>
      </Segment>
    </div>
  );
};
export default Dashboard;
