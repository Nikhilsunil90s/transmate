/* eslint-disable no-underscore-dangle */
import pick from "lodash.pick";
import merge from "lodash.merge";
import fixtures from "/imports/api/_jsonSchemas/fixtures/data.shipmentImport.json";
import { traverse } from "/imports/api/zz_utils/services/server/loadFixtures/cleanFixtureData";

import { GET_IMPORT_DOC, GET_IMPORT_ROWS } from "./queries";

const shipmentImport = fixtures.map(item => traverse(item))[0];

const gqlDataEmpty = {
  id: null,
  type: null,
  accountId: null,
  headers: null,
  errors: null,
  mapping: {
    headers: null,
    values: null,
    __typename: "ShipmentImportMapping"
  },
  progress: {
    data: null,
    lookup: null,
    mapping: null,
    jobs: null,
    process: null,
    __typename: "ShipmentImportProgress"
  },
  total: {
    empty: null,
    shipments: null,
    jobs: null,
    __typename: "ShipmentImportTotals"
  },
  settings: {
    numberFormat: null,
    dateFormat: null,
    __typename: "ShipmentImportSettings"
  },
  created: {
    by: null,
    at: null,
    __typename: "ByType"
  },
  __typename: "ShipmentImport"
};

const gqlData = merge(
  gqlDataEmpty,
  { id: shipmentImport._id },
  pick(
    shipmentImport,
    "type",
    "accountId",
    "headers",
    "errors",
    "mapping",
    "progress",
    "settings",
    "total",
    "created"
  )
);

export const importId = shipmentImport._id;
export const MocksForStep1 = [
  {
    request: {
      query: GET_IMPORT_DOC,
      variables: { importId }
    },
    result: {
      data: {
        imp: {
          ...gqlData,
          progress: {
            data: 0,
            lookup: null,
            mapping: null,
            jobs: null,
            process: null
          }
        }
      }
    }
  }
];

export const MocksForStep2 = [
  {
    request: {
      query: GET_IMPORT_DOC,
      variables: { importId }
    },
    result: {
      data: {
        imp: {
          ...gqlData,
          progress: {
            data: 1000,
            lookup: null,
            mapping: null,
            jobs: 0,
            process: null
          }
        }
      }
    }
  }
];

export const MocksForStep3 = [
  {
    request: {
      query: GET_IMPORT_DOC,
      variables: { importId }
    },
    result: {
      data: {
        imp: {
          ...gqlData,
          progress: {
            data: 1000,
            lookup: null,
            mapping: null,
            jobs: 100,
            process: null
          },
          total: {
            shipments: 10,
            jobs: null,
            empty: null
          }
        }
      }
    }
  }
];

export const MocksForStep4 = [
  {
    request: {
      query: GET_IMPORT_DOC,
      variables: { importId }
    },
    result: {
      data: {
        imp: {
          ...gqlData,
          progress: {
            data: 100,
            lookup: 100,
            mapping: 100,
            jobs: 100,
            process: 0,
            __typename: "ShipmentImportProgress"
          },
          total: {
            empty: 0,
            shipments: 10,
            jobs: 10,
            __typename: "ShipmentImportTotals"
          }
        }
      }
    }
  },
  {
    request: {
      query: GET_IMPORT_ROWS,
      variables: { importId }
    },
    result: {
      data: {
        imp: {
          id: importId,
          progress: {
            data: 100,
            lookup: 100,
            mapping: 100,
            jobs: 100,
            process: 0,
            __typename: "ShipmentImportProgress"
          },
          total: {
            empty: 0,
            shipments: 10,
            jobs: 10,
            __typename: "ShipmentImportTotals"
          },
          rows: [
            {
              id: "testRow1",
              data: {},
              status: "pending",
              result: null,
              log: null,
              __typename: "ShipmentImportRow"
            }
          ]
        }
      }
    }
  }
];
