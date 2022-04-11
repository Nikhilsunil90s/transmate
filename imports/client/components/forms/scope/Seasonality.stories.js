import React from "react";

import Seasonality from "./Seasonality.jsx";
import { scopeData } from "./.storydata.js";

export default {
  title: "Components/Scope/Seasonality"
};

export const control = () => {
  const props = {
    scope: scopeData,
    onSave: (update, cb) => {
      console.log(update);
      if (cb) cb();
    },
    canEdit: true,
    masterType: "analysis",
    masterId: "someAnalysisId"
  };

  return <Seasonality {...props} />;
};
