import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { TimeLineSection, FAQSection, ContactSection } from "../segments";
import GeneralTab from "./General.jsx";

import { tender, security } from "../utils/storyData";

export default {
  title: "Tender/Tabs/General"
};

const onSave = (update, cb) => {
  console.log({ update });
  if (typeof cb === "function") cb();
};

export const tabOwner = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <GeneralTab {...props} />
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
      canEditGeneral: false,
      canEditTenderFaq: false,
      canEditContacts: false,
      canPlaceBid: true,
      canGenerateProfile: false,
      isBidder: true,
      isOwner: false
    },
    onSave
  };

  return (
    <PageHolder main="Tender">
      <GeneralTab {...props} />
    </PageHolder>
  );
};

export const timeline = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <TimeLineSection {...props} />
    </PageHolder>
  );
};

export const FAQ = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <FAQSection {...props} />
    </PageHolder>
  );
};

export const FAQBidderView = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <FAQSection {...props} security={{ editTenderFaq: false }} />
    </PageHolder>
  );
};

export const contacts = () => {
  const props = { tender, security, onSave };

  return (
    <PageHolder main="Tender">
      <ContactSection {...props} />
    </PageHolder>
  );
};
