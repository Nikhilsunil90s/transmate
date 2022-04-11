import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import RequirementTab from "./Requirements.jsx";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/Requirements"
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
      <RequirementTab {...props} />
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
      canModifyTenderSettings: false,
      canEditRequirement: false,
      canGenerateProfile: false,
      isBidder: true
    },
    onSave,
    onSaveBid
  };

  return (
    <PageHolder main="Tender">
      <RequirementTab {...props} />
    </PageHolder>
  );
};

export const tabBidderLocked = () => {
  const props = {
    tender: {
      ...tender,
      bidders: [{ ...tender.bidders[1] }] // projecting the bidder
    },
    security: {
      ...security,
      canPlaceBid: false,
      canModifyTenderSettings: false,
      canEditRequirement: false,
      canGenerateProfile: false,
      isBidder: true
    },
    onSave,
    onSaveBid
  };

  return (
    <PageHolder main="Tender">
      <RequirementTab {...props} />
    </PageHolder>
  );
};
