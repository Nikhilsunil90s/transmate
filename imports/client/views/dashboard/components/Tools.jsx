import React from "react";
import { Trans } from "react-i18next";
import { List } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const TOOLS = {
  "price-lookup": {
    icon: "hand point right outline",
    pathName: "/price-lookup",
    text: "Price Lookup"
  },
  insights: {
    icon: "lightbulb outline",
    pathName: "/tools/route-insights",
    text: "Route Insights"
  },
  oceanDistance: {
    icon: "ship",
    pathName: "/tools/ocean-distance",
    text: "Ocean distance"
  }
};

const DashboardTools = () => {
  return (
    <IconSegment
      hideIcon
      className="basic"
      title={<Trans i18nKey="dashboard.tools.title" />}
      body={
        <List>
          {Object.values(TOOLS).map(({ icon, pathName, text }, i) => (
            <List.Item
              key={i}
              icon={icon}
              content={
                <a href={pathName} target="_blank" rel="noreferrer">
                  {text}
                </a>
              }
            />
          ))}
        </List>
      }
    />
  );
};

export default DashboardTools;
