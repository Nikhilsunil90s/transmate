import gql from "graphql-tag";

export const GET_ADDRESS_DATA = gql`
  query getAddressData($addressIds: [String]!) {
    address: getAddresses(addressIds: $addressIds) {
      id
      name
      city
      countryCode
    }
  }
`;

export const GET_ADDRESS_FRAGMENT = gql`
  fragment address on Address {
    id
    name
    city
    countryCode
  }
`;

export const GET_MY_TENDERS = gql`
  query getOwnTenders {
    tenders: getOwnTenders {
      id
      title
      created {
        by
        at
      }
    }
  }
`;

export const GET_MY_PRICELISTS = gql`
  query getOwnPriceListsScope($input: GetPriceListsInput!) {
    priceLists: getOwnPriceLists(input: $input) {
      id
      title
      carrierName
      type
      status
    }
  }
`;

export const GET_MY_SIMULATIONS = gql`
  query getAnalyses {
    simulations: getAnalyses(filters: { type: "simulation" }) {
      id
      name
      type
      created {
        by
        at
      }
    }
  }
`;

export const GET_ITEM_TYPES = gql`
  query getSettingsItemTypes {
    itemTypes: getSettingsItemTypes {
      type
      name
      code
      unitType
    }
  }
`;

export const COPY_SCOPE = gql`
  mutation copyScope($input: CopyScopeInput!) {
    result: copyScope(input: $input) {
      definition
    }
  }
`;
