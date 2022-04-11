import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import LockTab from "./NDALock";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/NDA"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const lock = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <LockTab {...props} />
    </PageHolder>
  );
};
