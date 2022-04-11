import { gql } from "@apollo/client";

import { fragments } from "/imports/api/shipments/apollo/fragments";

export const ADD_NON_CONFORMACE = gql`
  mutation addNonConformance($shipmentId: String!, $data: JSONObject!) {
    addNonConformance(shipmentId: $shipmentId, data: $data) {
      id
      ...shipmentNonConformances
    }
  }
  ${fragments.shipmentNonConformances}
`;

export const UPDATE_NON_CONFORMACE = gql`
  mutation updateNonConformance($id: String!, $update: JSONObject!) {
    updateNonConformance(id: $id, update: $update) {
      id
      ...shipmentNonConformances
    }
  }
  ${fragments.shipmentNonConformances}
`;

export const DELETE_NON_CONFORMACE = gql`
  mutation deleteNonConformance($id: String!) {
    deleteNonConformance(id: $id) {
      id
      ...shipmentNonConformances
    }
  }
  ${fragments.shipmentNonConformances}
`;
