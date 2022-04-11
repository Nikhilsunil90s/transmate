import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { PartnerPage } from "./Partner.jsx";
import { partnerId, partner, security } from "./utils/storyData";

export default {
  title: "Partners/page"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const Owner = () => {
  const props = { partnerId, partner, security, onSave };

  return (
    <PageHolder main="Partner">
      <PartnerPage {...props} />
    </PageHolder>
  );
};
