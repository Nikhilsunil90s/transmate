import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";
import { fragments as projectFragments } from "/imports/api/shipmentProject/apollo/fragments";

export const GET_SHIPMENTS_BY_PROJECT = gql`
  query getShipmentsByShipmentProject(
    $input: ShipmentsByShipmentProjectInput!
  ) {
    shipments: getShipmentsByShipmentProject(input: $input) {
      id
      accountId # for security
      carrierIds # for security
      shipperId
      type
      status
      number
      isTendered
      totals {
        additional
        total
        orgCurrency
        targetCurrency
      }
      costParams {
        entity
      }
      shipper {
        name
        id
        annotation {
          coding
        }
      }
      firstItem {
        id
        description
        commodity
        weight_net
        weight_tare
        weight_gross
        weight_unit
        quantity {
          amount
          code
        }
        references {
          containerNo
          truckId
          trailerId
        }
        temperature {
          condition
          range {
            from
            to
            unit
          }
        }
      }
      stage {
        plate
      }
      carrier {
        id
        name
        type
        annotation {
          coding
        }
      }
      references {
        container
        number
      }
      pickup {
        ...shipmentStop

        # projections:
        datePlanned
        dateScheduled
        dateActual
      }
      delivery {
        ...shipmentStop

        # projections:
        datePlanned
        dateScheduled
        dateActual
      }
    }
  }
  ${shipmentFragments.shipmentStop}
`;

export const GET_PROJECT = gql`
  query getShipmentProject($shipmentProjectId: String!) {
    shipmentProject: getShipmentProject(shipmentProjectId: $shipmentProjectId) {
      ...project
      ...projectStakeholders
      ...projectLocation
      ...projectNotes

      # projection:
      canEdit
    }
  }
  ${projectFragments.project}
  ${projectFragments.projectStakeholders}
  ${projectFragments.projectLocation}
  ${projectFragments.projectNotes}
`;

export const GET_ACCOUNT_SETTINGS = gql`
  query getAccountSettingsPropjectCodes {
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

export const REFRESH_PARTNERS = gql`
  mutation refreshProjectPartners($shipmentProjectId: String!) {
    partners: refreshProjectPartners(shipmentProjectId: $shipmentProjectId) {
      id
      partners {
        id
        name
      }
    }
  }
`;

export const EDIT_SHIPMENT_PROJECT = gql`
  mutation editShipmentProject($input: EditProjectInput!) {
    editShipmentProject(input: $input) {
      id
      ...projectStakeholders
    }
  }

  ${projectFragments.projectStakeholders}
`;

export const EDIT_SHIPMENT_PROJECT_LOCATION = gql`
  mutation editShipmentProjectLocation($input: EditProjectLocationInput!) {
    editShipmentProjectLocation(input: $input) {
      id
      ...projectLocation
    }
  }
  ${projectFragments.projectLocation}
`;

export const EDIT_SHIPMENT_PROJECT_NOTES = gql`
  mutation editShipmentProjectNotes($input: EditProjectNotesInput!) {
    editShipmentProjectNotes(input: $input) {
      id
      ...projectNotes
    }
  }
  ${projectFragments.projectNotes}
`;

export const REMOVE_EXISTING_SHIPMENT_FROM_PROJECT = gql`
  mutation removeExistingShipmentFromProject(
    $input: RemoveExistingShipmentFromProjectType!
  ) {
    removeExistingShipmentFromProject(input: $input)
  }
`;

export const DUPLICATE_SHIPMENT = gql`
  mutation duplicateShipment($input: DuplicateShipmentInput!) {
    newShipmentId: duplicateShipment(input: $input)
  }
`;

export const REMOVE_PROJECT = gql`
  mutation removeShipmentProject($input: RemoveProjectInput!) {
    removeShipmentProject(input: $input)
  }
`;
