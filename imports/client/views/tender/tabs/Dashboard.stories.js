import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";

import DashboardTab from "./Dashboard.jsx";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/Dashboard"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const tab = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <DashboardTab {...props} />
    </PageHolder>
  );
};
