import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";

import { TenderPage } from "./Tender.jsx";

import { tender, security } from "./utils/storyData";

export default {
  title: "Tender/page"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const Owner = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <TenderPage {...props} />
    </PageHolder>
  );
};
