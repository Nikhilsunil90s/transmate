import gql from "graphql-tag";

export const GET_SCOPE_DETAIL = gql`
  query getScope($input: GetScopeInput!) {
    scopeDetail: getScope(input: $input) {
      id
      name

      laneId
      volumeGroupId
      volumeRangeId
      goodsDG
      equipmentId

      # de-normalization:
      lanes
      volumes
      equipments

      quantity {
        count
        amount
        equipment
        currentCost
        leadTime
      }
    }
  }
`;

export const SCOPE_SHIP_QUERY = gql`
  query getScopeShipData($input: ScopeShipQueryInput!) {
    getScopeShipData(input: $input)
  }
`;

export const SCOPE_DATA_FROM_SOURCE = gql`
  mutation scopeDataFromSource($input: ScopeDataSourceInput!) {
    scopeDataFromSource(input: $input)
  }
`;

export const SCOPE_GENERATE_DATA_FILL = gql`
  mutation scopeGenerateDataFill($input: ScopeDataSourceInput!) {
    scopeGenerateDataFill(input: $input)
  }
`;
