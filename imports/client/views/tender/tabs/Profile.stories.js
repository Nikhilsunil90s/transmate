import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ProfileTab from "./Profile.jsx";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/Profile"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

const onSaveBid = (topic, update) => {
  console.log({ topic: update });
};

export const tabOwner = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <ProfileTab {...props} />
    </PageHolder>
  );
};

export const tabBidder = () => {
  const props = {
    tender: {
      ...tender,
      bidders: [{ ...tender.bidders[1] }] // projecting the bidder
    },
    security: {
      ...security,
      canPlaceBid: true,
      canGenerateProfile: false,
      isBidder: true
    },
    onSave,
    onSaveBid
  };

  return (
    <PageHolder main="Tender">
      <ProfileTab {...props} />
    </PageHolder>
  );
};
