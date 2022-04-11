import gql from "graphql-tag";

export const fragments = {
  shipmentImportBase: gql`
    fragment shipmentImportBase on ShipmentImport {
      id
      type
      accountId
      headers
      errors {
        error
        message
      }
      mapping {
        headers
        values
        samples
      }
      progress {
        data
        lookup
        mapping
        jobs
        process
      }
      total {
        empty
        shipments
        jobs
      }
      settings {
        numberFormat
        dateFormat
      }
      # Time stamps
      created {
        by
        at
      }
    }
  `,
  importProgress: gql`
    fragment importProgress on ShipmentImport {
      progress {
        data
        lookup
        mapping
        jobs
        process
      }
      total {
        empty
        shipments
        jobs
      }
    }
  `,
  shipmentImportRows: gql`
    fragment shipmentImportRows on ShipmentImport {
      rows {
        id
        data
        status
        result
        log
      }
    }
  `,
  importErrors: gql`
    fragment importErrors on ShipmentImport {
      errors {
        error
        message
      }
    }
  `
};
