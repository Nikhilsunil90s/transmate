import { gql } from "@apollo/client";
import { fragments as stageFragments } from "/imports/api/stages/apollo/fragments";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const STAGE_STATUS_UPDATE = gql`
  mutation setStageStatus($stageId: String!, $status: STAGE_STATUS!) {
    setStageStatus(stageId: $stageId, status: $status) {
      id
      status
      stages {
        id
        status
      }
      stageCount
    }
  }
`;

export const STAGE_MERGE = gql`
  mutation mergeStage($stageId: String!) {
    mergeStage(stageId: $stageId) {
      id
      status
      stages {
        id
        status
        from {
          ...stageStop
        }
        to {
          ...stageStop
        }
      }
      stageCount
    }
  }
  ${stageFragments.stageStop}
`;

export const STAGE_SPLIT = gql`
  mutation splitStage($stageId: String!, $location: LocationInput!) {
    splitStage(stageId: $stageId, location: $location) {
      id
      status
      stages {
        id
        status
        from {
          ...stageStop
        }
        to {
          ...stageStop
        }
      }
      stageCount
    }
  }
  ${stageFragments.stageStop}
`;

export const CONFIRM_STAGE = gql`
  mutation confirmStage($input: StageConfirmInput!) {
    confirmStage(input: $input) {
      id
      status
      stages {
        id
        status
        ...stageDates
      }
    }
  }
  ${stageFragments.stageDates}
`;

export const UPDATE_STAGE = gql`
  mutation updateStage($input: StageUpdateInput!) {
    updateStage(input: $input) {
      id
      status
      stages {
        id
        status
        mode
        from {
          ...stageStop
        }
        to {
          ...stageStop
        }
        ...stageDates
      }
    }
  }
  ${stageFragments.stageStop}
  ${stageFragments.stageDates}
`;

export const UPDATE_STAGE_LOCATION = gql`
  mutation updateStageLocation($input: StageLocationUpdate!) {
    updateStageLocation(input: $input) {
      id
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      stages {
        id
        from {
          ...stageStop
        }
        to {
          ...stageStop
        }
      }
    }
  }
  ${stageFragments.stageStop}
  ${shipmentFragments.shipmentStop}
`;

export const ALLOCATE_STAGE_TO_DRIVER = gql`
  mutation allocateStage($input: StageAllocationUpdate!) {
    allocateStage(input: $input) {
      id
      carrierId
      status
    }
  }
`;

export const SCHEDULE_STAGE = gql`
  mutation scheduleStage($input: StageScheduleInput!) {
    scheduleStage(input: $input) {
      id
      status
      stages {
        id
        status
        ...stageDates
      }
    }
  }
  ${stageFragments.stageDates}
`;

export const GET_USERS_FOR_DRIVER_SELECTION = gql`
  query getUsersForDriverSelection($roles: [String]) {
    users: getUsersForOwnAccount(roles: $roles) {
      id
      name
    }
  }
`;
