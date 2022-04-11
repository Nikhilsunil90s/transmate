import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import { ScenarioPage } from "./Scenario.jsx";

import { analysis, security } from "./utils/storyData";

export default {
  title: "Analysis/scenario"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const Simulation = () => {
  const props = {
    analysisId: analysis._id,
    scenario: analysis.scenario,
    security,
    onSave
  };

  return (
    <PageHolder main="Analysis">
      <ScenarioPage {...props} />
    </PageHolder>
  );
};
