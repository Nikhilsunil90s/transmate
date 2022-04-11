import gql from "graphql-tag";
import { fragments } from "/imports/api/shipmentProject/apollo/fragments";

export const GET_SHIPMENT_PROJECTS = gql`
  query getShipmentProjectsInProjectOverview(
    $filters: GetShipmentProjectsInput
  ) {
    shipmentProjects: getShipmentProjects(filters: $filters) {
      ...project
      ...projectLocation
      inCount
      outCount
    }
  }
  ${fragments.project}
  ${fragments.projectLocation}
`;

export const CREATE_SHIPMENT_PROJECT = gql`
  mutation createShipmentProject($input: ShipmentProjectInput!) {
    createShipmentProject(input: $input) {
      ...project
    }
  }
  ${fragments.project}
`;

export const GET_ACCOUNT_SETTINGS = gql`
  query getAccountSettingsProjectCodesOverview {
    accountSettings: getAccountSettings {
      id
      projectCodes {
        group
        code
        name
        description
      }
      projectYears
    }
  }
`;
