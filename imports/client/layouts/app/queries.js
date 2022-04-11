import gql from "graphql-tag";
import { fragments as userFragments } from "/imports/api/users/apollo/fragments";
import { fragments as accountFragments } from "/imports/api/allAccounts/apollo/fragments";

export const APP_ROOT_QUERY = gql`
  query getAccountRoot {
    account: getOwnAccount {
      id
      name
      type
      features
      ...entities
    }
    currentUser: getCurrentUser {
      ...userCore
      ...userPrefsAndSettings
      lastActivity
    }
  }
  ${userFragments.userCore}
  ${userFragments.userPrefsAndSettings}
  ${accountFragments.entities}
`;
