import { ByAtModel } from "/imports/api/_interfaces/model.d";

export interface ShipmentImportError {
  error: string;
  message: string;
}

export interface ShipmentImport {
  _id: string;
  id: String;
  type: string;
  accountId: string;
  headers: Array<string>;
  errors: Array<ShipmentImportError>;
  mapping: {
    headers: Object;
    values: Object;
    samples: Object;
  };
  progress: {
    data: number;
    lookup: number;
    mapping: number;
    jobs: number;
    process: number;
  };
  total: {
    empty: number;
    shipments: number;
    jobs: number;
  };
  settings: {
    numberFormat: string;
    dateFormat: string;
  };

  created: ByAtModel;
}

export interface ShipmentImportRow {
  _id: string;
  importId: string;
  i: number;
  data: Object;
}
