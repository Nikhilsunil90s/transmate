import gql from "graphql-tag";

export const START_DATA_IMPORT = gql`
  mutation startDataImport($input: DataImportInput!) {
    startDataImport(input: $input)
  }
`;
