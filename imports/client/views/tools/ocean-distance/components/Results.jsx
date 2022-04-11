import React from "react";
import { Trans } from "react-i18next";
import { Grid, Statistic } from "semantic-ui-react";
import { NumberTag } from "/imports/client/components/tags";
import { DisplayMapClass } from "/imports/client/components/maps/HereMap";

const Map = ({ results }) => {
  if (!(results && results.ports)) return null;

  const from = results.ports[0];
  const to = results.ports.slice(-1)[0];
  const markers = [from, to].map(({ lat, lng, port }, i) => ({
    coords: { lat, lng },
    color: i === 0 ? "green" : "blue",
    title: port
  }));

  return <DisplayMapClass {...{ height: 300, markers, mapType: "truck", maxZoom: 10 }} />;
};

const OceanDistanceResults = ({ results }) => {
  if (!results)
    return (
      <p>
        <Trans i18nKey="tools.oceanDistance.noResults" />
      </p>
    );
  return (
    <Grid columns={2}>
      <Grid.Column>
        <Map results={results} />
      </Grid.Column>
      <Grid.Column>
        <Statistic.Group horizontal>
          <Statistic value={<NumberTag value={results.km} />} label="km" />
          <Statistic value={<NumberTag value={results.nm} />} label="nm" />
        </Statistic.Group>
      </Grid.Column>
    </Grid>
  );
};

export default OceanDistanceResults;
