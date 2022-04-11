import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import { SimulationPage } from "./Simulation.jsx";

import { analysis, security } from "./utils/storyData";

export default {
  title: "Analysis/simulation"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const Simulation = () => {
  const props = { analysisId: analysis._id, analysis, security, onSave };

  return (
    <PageHolder main="Analysis">
      <SimulationPage {...props} />
    </PageHolder>
  );
};
