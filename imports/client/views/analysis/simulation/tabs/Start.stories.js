import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import StartTab from "./Start.jsx";

import { analysis, security } from "../utils/storyData";

export default {
  title: "Analysis/simulation/tabs/start"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const tab = () => {
  const props = {
    analysisId: analysis._id,
    simulation: analysis.simulation,
    security,
    onSave
  };

  return (
    <PageHolder main="Tender">
      <StartTab {...props} />
    </PageHolder>
  );
};
