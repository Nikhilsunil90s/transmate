import gql from "graphql-tag";
import {
  settingsFragments,
  fragments as accountFragments
} from "/imports/api/allAccounts/apollo/fragments";

export const SAVE_MASTER_DATA = gql`
  mutation updateAccountSettings($updates: AccountSettingsUpdates!) {
    updateAccountSettings(updates: $updates) {
      id
      ...projectSettings
    }
  }
  ${settingsFragments.projectSettings}
`;

export const GET_ACCOUNT_AND_USER_DATA = gql`
  query getOwnAccountForSettings {
    account: getOwnAccount {
      id
      ...accountProfileBase
      ...entities
    }
    user: getCurrentUser {
      ...userBase
      ...userPrefs
    }
  }
  ${settingsFragments.accountProfileBase}
  ${accountFragments.entities}
  ${settingsFragments.userBase}
  ${settingsFragments.userPrefs}
`;

export const GET_PROJECT_SETTINGS = gql`
  query getAccountSettingsProjectSettings {
    accountSettings: getAccountSettings {
      id
      ...projectSettings
    }
  }
  ${settingsFragments.projectSettings}
`;

export const GET_ACCOUNT_ROLES = gql`
  query getAccountSettingsAccountRoles {
    accountSettings: getAccountSettings {
      id
      roleNames
    }
  }
`;

export const GET_ACCOUNT_USERS = gql`
  query getAccountUsers {
    account: getAccountUsers {
      id
      ...users
    }
  }
  ${accountFragments.users}
`;

export const REMOVE_USER = gql`
  mutation removeUserFromAccount($userId: String!) {
    removeUserFromAccount(userId: $userId) {
      id
      ...users
    }
  }
  ${accountFragments.users}
`;

export const ADD_USER = gql`
  mutation addUserToAccount($input: NewUserInput!) {
    addUserToAccount(input: $input) {
      id
      ...users
    }
  }
  ${accountFragments.users}
`;

export const UPDATE_USER_ROLE = gql`
  mutation updateUserRole($input: UserRoleUpdateInput!) {
    updateUserRole(input: $input) {
      id
      baseRoles
    }
  }
`;

export const UPDATE_USER_SELF = gql`
  mutation updateUserSelf($updates: UpdateUserInput!) {
    updateUserSelf(updates: $updates) {
      ...userBase
    }
  }
  ${settingsFragments.userBase}
`;

export const UPDATE_USER_PREFERENCES = gql`
  mutation updateUserPreferencesInSettingsPage(
    $updates: UserPreferenceUpdateInput!
  ) {
    updateUserPreferences(updates: $updates) {
      id
      ...userPrefs
    }
  }
  ${settingsFragments.userPrefs}
`;

export const UPDATE_ACCOUNT = gql`
  mutation updateAccount($updates: AccountUpdateInput!) {
    updateAccount(updates: $updates) {
      id
      ...accountProfileBase
      ...entities
    }
  }
  ${settingsFragments.accountProfileBase}
  ${accountFragments.entities}
`;

export const SET_API_KEY_FOR_USER = gql`
  mutation setApiKeyForUser {
    setApiKeyForUser {
      ...userBase
    }
  }
  ${settingsFragments.userBase}
`;
