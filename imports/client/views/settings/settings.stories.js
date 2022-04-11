import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { SettingsPage } from "./Settings.jsx";
import { projectMocks, userMocks, fuelMocks } from "./utils/storyData";
import { LoginProvider } from "/imports/client/context/loginContext";

export default {
  title: "Settings"
};

const data = {
  user: {
    id: "userId",
    profile: {
      first: "firstName",
      last: "lastName",
      apiKey: "cbcf0667d25f4106c8ee"
    }
  },
  account: {
    id: "AccountId",
    name: "Demo account",
    entities: [
      {
        code: "CODE 1",
        name: "entity 1",
        address: "some address",
        zipCode: "12345",
        city: "Paris",
        country: "FR",
        UID: "UID",
        registrationNumber: "RegNo",
        EORI: "EORI #",
        VAT: "VAT #",
        email: "test@test.com"
      }
    ]
  },
  security: {},
  key: null
};

// user:
export const pageUserProfile = () => {
  const props = {
    ...data,
    section: "user-profile"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={[]} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const pageUserSecurity = () => {
  const props = {
    ...data,
    section: "security"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={[]} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const pageUserNotifications = () => {
  const props = {
    ...data,
    section: "notifications"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={[]} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

// admin
export const pageAdminProfile = () => {
  const props = {
    ...data,
    section: "account-profile"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={userMocks} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const pageAdminEntities = () => {
  const props = {
    ...data,
    section: "account-entities"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={userMocks} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

export const pageAdminUsers = () => {
  const props = {
    ...data,
    section: "account-users",
    topic: "projects"
  };
  return (
    <PageHolder main="Settings">
      <MockedProvider mocks={userMocks} addTypename={false}>
        <SettingsPage {...props} />
      </MockedProvider>
    </PageHolder>
  );
};

// data
export const pageDataFuel = () => {
  const props = {
    ...data,
    section: "fuel"
  };
  return (
    <LoginProvider value={{ account: {}, user: {}, userId: "myUserId" }}>
      <PageHolder main="Settings">
        <MockedProvider mocks={fuelMocks} addTypename={false}>
          <SettingsPage {...props} />
        </MockedProvider>
      </PageHolder>
    </LoginProvider>
  );
};

export const pageDataProjects = () => {
  const props = {
    ...data,
    section: "master-data",
    topic: "projects"
  };
  return (
    <LoginProvider value={{ account: {}, user: {}, userId: "myUserId" }}>
      <PageHolder main="Settings">
        <MockedProvider mocks={projectMocks} addTypename={false}>
          <SettingsPage {...props} />
        </MockedProvider>
      </PageHolder>
    </LoginProvider>
  );
};
