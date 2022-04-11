import gql from "graphql-tag";

// import { settingsFragments } from "/imports/api/allAccounts/apollo/fragments";

export const GET_GENERAL_SETTINGS = gql`
  query getAccountSettingsAccountData {
    accountSettings: getAccountSettings {
      id
      tags
      costs {
        id
        type
        group
        cost
      }
    }
  }
`;

export const REMOVE_SETTING_COST = gql`
  mutation removeAccountSettingsCost($id: String!) {
    removeAccountSettingsCost(id: $id)
  }
`;

export const UPSERT_SETTING_COST = gql`
  mutation upsertAccountSettingsCost($input: UpdateAccountCostSettingInput!) {
    upsertAccountSettingsCost(input: $input)
  }
`;
