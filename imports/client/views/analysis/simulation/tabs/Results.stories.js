import React from "react";
import { Segment } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import ResultsTab, {
  CheapestOverall,
  CheapestSingle,
  LaneResult
} from "./Results.jsx";

import { analysis, security } from "../utils/storyData";

export default {
  title: "Analysis/simulation/tabs/results"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const Simulation = () => {
  const props = {
    analysisId: analysis._id,
    simulation: analysis.simulation,
    security,
    onSave
  };

  return (
    <PageHolder main="Analysis">
      <ResultsTab {...props} />
    </PageHolder>
  );
};

export const laneResult = () => {
  const props = {
    aggregated: analysis.simulation.aggregates?.byLanes,
    priceLists: analysis.simulation.priceLists,
    simulation: analysis.simulation,
    currency: "EUR"
  };

  return <LaneResult {...props} />;
};

export const Overall = () => {
  const props = {
    priceLists: analysis.simulation.priceLists,
    combi: analysis.simulation.aggregates.combi,
    currency: "EUR"
  };
  return (
    <PageHolder main="Analysis">
      <Segment>
        <CheapestOverall {...props} />
      </Segment>
    </PageHolder>
  );
};

export const Single = () => {
  const props = {
    priceLists: analysis.simulation.priceLists,
    aggregated: analysis.simulation.aggregates?.topLevel,
    currency: "EUR"
  };
  return (
    <PageHolder main="Analysis">
      <Segment>
        <CheapestSingle {...props} />
      </Segment>
    </PageHolder>
  );
};
