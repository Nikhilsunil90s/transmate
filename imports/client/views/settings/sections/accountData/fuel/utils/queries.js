import gql from "graphql-tag";

import { fragments as fuelFragments } from "/imports/api/fuel/apollo/fragments";

export const GET_MY_FUEL_INDEXES = gql`
  query getFuelIndexesForSettings {
    fuelIndexes: getFuelIndexes {
      ...fuelBase
    }
  }
  ${fuelFragments.fuelBase}
`;

export const GET_FUEL_INDEX = gql`
  query getFuelIndexForSettingsPage($fuelIndexId: String!) {
    fuelIndex: getFuelIndex(fuelIndexId: $fuelIndexId) {
      ...fuelBase
      ...fuelDetail
    }
  }
  ${fuelFragments.fuelBase}
  ${fuelFragments.fuelDetail}
`;

export const UPDATE_FUEL_INDEX = gql`
  mutation updateFuelIndex($input: FuelIndexUpdateInput!) {
    updateFuelIndex(input: $input) {
      ...fuelBase
      ...fuelDetail
    }
  }
  ${fuelFragments.fuelBase}
  ${fuelFragments.fuelDetail}
`;

export const ADD_FUEL_INDEX = gql`
  mutation addFuelIndex($fuel: JSONObject!) {
    addFuelIndex(fuel: $fuel) {
      ...fuelBase
      ...fuelDetail
    }
  }
  ${fuelFragments.fuelBase}
  ${fuelFragments.fuelDetail}
`;

export const REMOVE_FUEL_INDEX = gql`
  mutation removeFuelIndex($fuelIndexId: String!) {
    removeFuelIndex(fuelIndexId: $fuelIndexId)
  }
`;
