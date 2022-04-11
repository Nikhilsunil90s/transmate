/* eslint-disable react/no-danger */
import React from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { List, Segment, Header, Message } from "semantic-ui-react";
import { DateTag } from "/imports/client/components/tags";

import { GET_USAGE } from "./utils/queries";

const debug = require("debug")("tools:routeInsight");

type locationType = {
  addressId?: string;
  locode?: string;
  countryCode: string;
  zipCode: string;
};

type searchItemtype = {
  from: locationType;
  to: locationType;
};

function convertToLocationString(loc: locationType): string {
  return loc.locode ? loc.locode : `${loc.countryCode}-${loc.zipCode}`;
}

function searchSummary(item: searchItemtype): string {
  if (!item) return "";
  const arr = ["from", "to"].map(dir => convertToLocationString(item[dir]));
  return arr.join(" - ");
}

const ToolsPriceLookupAside = () => {
  const { data = {}, error, loading } = useQuery(GET_USAGE, {
    variables: {
      input: { activity: "tools.price-lookup", thisMonthOnly: true }
    }
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
        header={<Trans i18nKey="tools.priceLookup.message.title" />}
        content={<Trans i18nKey="tools.priceLookup.message.text" />}
      />

      <Header
        as="h5"
        dividing
        content={<Trans i18nKey="tools.priceLookup.aside.history.title" />}
      />
      {usage ? (
        <>
          <p>
            <Trans
              i18nKey="tools.priceLookup.aside.usage"
              values={{ usage: usage.length }}
            />
          </p>

          <List>
            {lastFiveItems.map((item, i) => (
              <List.Item key={i}>
                <List.Content>
                  <List.Header content={searchSummary(item.data)} />
                  <List.Description content={<DateTag date={item.ts} />} />
                </List.Content>
              </List.Item>
            ))}
          </List>
        </>
      ) : (
        <p>
          <Trans i18nKey="tools.priceLookup.aside.history.empty" />
        </p>
      )}
    </Segment>
  );
};

export default ToolsPriceLookupAside;
