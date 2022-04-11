import gql from "graphql-tag";
import { fragments as dataImportFragments } from "/imports/api/imports/apollo-dataImports/fragments";

export const GET_DATA_IMPORT = gql`
  query getDataImport($importId: String!) {
    imp: getDataImport(importId: $importId) {
      ...dataImportBase
      ...dataImportRows
    }
  }
  ${dataImportFragments.dataImportBase}
  ${dataImportFragments.dataImportRows}
`;
export const GET_IMPORT = gql`
  query getDataImportMain($importId: String!) {
    importDoc: getDataImport(importId: $importId) {
      ...dataImportBase
    }
  }
  ${dataImportFragments.dataImportBase}
`;
