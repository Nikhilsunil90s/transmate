import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import SettingsUserSecurity from "./UserSecurity.jsx";
import SettingsUserNotifications from "./Notifications.jsx";
import SettingsUserProfile from "./UserProfile.jsx";

export default {
  title: "Settings/User"
};

const data = {
  user: {
    id: "K3hqjR5zBoDZRccEx",
    name: "Demo User",
    avatar: null,
    preferences: {
      notifications: [
        { group: "shipments", subGroup: "updates", mail: false, app: true }
      ]
    },
    profile: {
      first: "demo",
      last: "User"
    }
  },
  account: {
    name: "Test account"
  },
  accessControl: () => {},
  security: {},
  key: null
};

export const security = () => {
  return (
    <PageHolder main="Settings">
      <SettingsUserSecurity />
    </PageHolder>
  );
};

export const notifications = () => {
  return (
    <PageHolder main="Settings">
      <SettingsUserNotifications {...data} title="Notifications" />
    </PageHolder>
  );
};

export const profile = () => {
  return (
    <PageHolder main="Settings">
      <SettingsUserProfile {...data} title="Profile" />
    </PageHolder>
  );
};
