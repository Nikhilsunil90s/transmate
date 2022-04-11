import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import OptionTab from "./Options.jsx";

import { analysis, security } from "../utils/storyData";

export default {
  title: "Analysis/simulation/tabs/options"
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
    <PageHolder main="Tender">
      <OptionTab {...props} />
    </PageHolder>
  );
};
