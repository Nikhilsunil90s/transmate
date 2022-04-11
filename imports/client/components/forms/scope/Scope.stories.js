import React from "react";

import ScopeDefinition from "./Scope.jsx";
import { scopeData } from "./.storydata.js";

export default {
  title: "Components/Scope/Definition"
};

export const overview = () => {
  const props = {
    scope: scopeData,
    onSave: (update, cb) => {
      console.log(update);
      if (cb) cb();
    },
    canEdit: true,
    masterType: "tender",
    masterId: "someTenderId"
  };

  return <ScopeDefinition {...props} />;
};
