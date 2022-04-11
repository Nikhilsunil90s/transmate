import gql from "graphql-tag";

export const fragments = {
  tenderifySettings: gql`
    fragment tenderifySettings on Settings {
      mapBlocks
      mappingParents
      mappingStoreOptions
      mappingStoreOptionsDefault
      mappingListOptions {
        services
        equipments
        multipliers
      }

      mappingKeys {
        k
        parent
        type
        label
        description
        sequence
        group
        mappingFunction
        input {
          type
          source
        }
      }
    }
  `,
  workflowTypeSettings: gql`
    fragment workflowTypeSettings on Settings {
      id
      workflowTypes {
        id
        label
        inputs {
          id
          label
          type
        }
      }
    }
  `
};
