import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { toast, ToastContainer } from "react-toastify";

import { LaneForm } from "./modals/Lane.jsx";
import LaneOverview from "./Lanes.jsx";
import { scopeData } from "./.storydata.js";

export default {
  title: "Components/Scope/Lanes"
};

export const form = () => {
  const props = {
    lane: scopeData.lanes[0],
    onSubmitform: console.log
  };

  return (
    <PageHolder main="Tender">
      <LaneForm {...props} />
    </PageHolder>
  );
};

export const overview = () => {
  const props = {
    lanes: scopeData.lanes,
    onSave: () => toast.error("No save possible edit"),
    canEdit: true
  };

  return (
    <PageHolder main="Tender">
      <LaneOverview {...props} />
      <ToastContainer position="top-right" />
    </PageHolder>
  );
};
