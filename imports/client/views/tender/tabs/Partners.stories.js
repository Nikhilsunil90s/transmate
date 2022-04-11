import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import PartnerTab from "./Partners.jsx";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/Partners"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const tab = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <PartnerTab {...props} />
    </PageHolder>
  );
};
