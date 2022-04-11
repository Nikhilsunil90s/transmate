import React from "react";
import { Trans } from "react-i18next";
import { List } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const ARTICLES = [
  {
    link: "https://www.transmate.eu/help/getting-started",
    text: "Getting started"
  },
  {
    link: "https://www.transmate.eu/help/freight-engine",
    text: "Freight engine"
  },
  {
    link: "https://www.transmate.eu/support/helpdesk",
    text: "Documentation"
  }
];

const DashboardArticles = () => {
  return (
    <IconSegment
      hideIcon
      className="basic"
      title={<Trans i18nKey="dashboard.articles.title" />}
      body={
        <List>
          {ARTICLES.map((article, i) => (
            <List.Item
              key={i}
              content={
                <a href={article.link} target="_blank" rel="noreferrer">
                  {article.text}
                </a>
              }
            />
          ))}
        </List>
      }
    />
  );
};

export default DashboardArticles;
