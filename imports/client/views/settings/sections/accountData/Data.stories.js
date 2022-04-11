import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import SettingsFuel from "./fuel/Fuel.jsx";
import { PeriodForm } from "./fuel/modals/Period";

import { ProjectForm } from "./data/projects/modals/ProjectModal";

import { fuelMocks, fuelIndexDetail } from "../../utils/storyData";

export default {
  title: "Settings/Data"
};

const dummyProps = {
  title: "Fuel",
  icon: "drop",
  security: {
    canEditFuelModel: true
  }
};

export const fuel = () => {
  const props = { ...dummyProps };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={fuelMocks} addTypename={false}>
        <SettingsFuel {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const fuelPeriodForm = () => {
  const props = {
    fuelIndex: fuelIndexDetail,
    onSave: console.log
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={fuelMocks} addTypename={false}>
        <PeriodForm {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const newProjectForm = () => {
  const props = {
    data: {},
    onSave: console.log
  };
  return <ProjectForm {...props} />;
};
