import gql from "graphql-tag";

export const fragments = {
  dataImportBase: gql`
    fragment dataImportBase on DataImport {
      id
      accountId
      data
      errors
      references {
        invoiceId
      }
      type
    }
  `,
  dataImportRows: gql`
    fragment dataImportRows on DataImport {
      rows {
        id
        data
        status
        result
        log
      }
    }
  `
};
