import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import { EquipmentForm } from "./modals/Equipment.jsx";
import EquipmentOverview from "./Equipments.jsx";
import { scopeData } from "./.storydata.js";

export default {
  title: "Components/Scope/Equipments"
};

export const form = () => {
  const props = {
    lane: scopeData.equipments[0],
    onSubmitform: console.log
  };

  return (
    <PageHolder main="Tender">
      <EquipmentForm {...props} />
    </PageHolder>
  );
};

export const overview = () => {
  const props = {
    equipments: scopeData.equipments,
    onSave: (update, cb) => {
      console.log(update);
      if (cb) cb();
    },
    canEdit: true
  };

  return (
    <PageHolder main="Tender">
      <EquipmentOverview {...props} />
    </PageHolder>
  );
};
