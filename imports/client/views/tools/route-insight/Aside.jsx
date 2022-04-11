/* eslint-disable react/no-danger */
import React from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { List, Segment, Header, Message } from "semantic-ui-react";
import { MomentTag } from "/imports/client/components/tags";

import { GET_USAGE } from "./utils/queries";

const debug = require("debug")("tools:routeInsight");

function searchSummary(item) {
  const arr = ["from", "to"].map(dir => {
    if (item[dir].locationId) {
      return item[dir].locationId;
    }
    return `${item[dir].countryCode}${item[dir].zipCode}`;
  });

  return arr.join(" - ");
}

const ToolsRouteInsightAside = () => {
  const { data = {}, error, loading } = useQuery(GET_USAGE, {
    variables: { input: { activity: "tools.route-insight", thisMonthOnly: true } }
  });
  debug("aside", { data });
  if (error) console.error({ error });
  const { usage } = data;
  const lastFiveItems = (usage || []).slice(0, 5);

  return (
    <Segment basic padded loading={loading}>
      <Message
        icon="lightbulb"
        info
        header={<Trans i18nKey="tools.routeInsights.message.title" />}
        content={<Trans i18nKey="tools.routeInsights.message.text" />}
      />

      <Header
        as="h5"
        dividing
        content={<Trans i18nKey="tools.routeInsights.aside.history.title" />}
      />
      {usage ? (
        <>
          <p>
            <Trans i18nKey="tools.routeInsights.aside.usage" values={{ usage: usage.length }} />
          </p>

          <List>
            {lastFiveItems.map((item, i) => (
              <List.Item key={i}>
                <List.Content>
                  <List.Header content={searchSummary(item.data)} />
                  <List.Description content={<MomentTag date={item.ts} />} />
                </List.Content>
              </List.Item>
            ))}
          </List>
        </>
      ) : (
        <p>
          <Trans i18nKey="tools.routeInsights.aside.history.empty" />
        </p>
      )}
    </Segment>
  );
};

export default ToolsRouteInsightAside;
