/* eslint-disable lines-between-class-members */
import _ from "lodash";
import dot from "dot-object";
import { mapImportRow, pivot } from "../helpers/fnImportHelpers";

// collections
import { Import } from "/imports/api/imports/Import-shipments";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";

const debug = require("debug")("imports:importProcesser");

debug("importProcesser loaded, schema loaded");

interface Query {
  importId: string;
  i?: number;
}

// this job is triggered by the import process.
// allows import to be done async
export class ImportProcesser {
  accountId: string;
  imp: any;
  importId: string;
  numberCol: Object;
  rows: Array<Object>;
  errors: Array<{
    error: string;
    message: string;
  }>;
  shipment: any;

  constructor({ accountId }) {
    this.accountId = accountId;
    this.errors = [];
    return this;
  }

  async init({
    importId,
    imp,
    number
  }: {
    importId?: string;
    imp?: any;
    number?: number;
  }) {
    this.imp = imp || (await Import.first(importId));
    this.importId = importId || this.imp.id;
    const query: Query = { importId: this.importId };
    if (!number) {
      // just get first row
      query.i = 1;
    } else {
      this.numberCol = _.invert(this.imp.mapping.headers)[
        "shipment.references.number"
      ];
      query[`data.${this.numberCol}`] = number;
    }
    const cursor = await EdiRows.find(query);
    this.rows = await cursor.fetch();
    return this;
  }

  prepareShipmentData() {
    const shipment = dot.object(
      mapImportRow(this.imp, this.rows[0].data, "shipment", this.errors)
    );
    if (/^S/.test(this.accountId)) {
      Object.assign(shipment, {
        shipperId: this.accountId,
        consigneeId: this.accountId
      });
    }
    shipment.stages = pivot(this.imp, this.rows, "stage", this.errors);

    shipment.items = pivot(this.imp, this.rows, "item", this.errors);
    shipment.items = shipment.items.map(item => {
      // set default item qty on 1 pcs
      const defaultItem = { quantity: 1, quantity_unit: "pcs" };
      debug("setup item with this data %j", Object.assign(defaultItem, item));
      return Object.assign(defaultItem, item);
    });

    // identifier for delete/revert import
    shipment.edi = {
      account: { [this.accountId]: { importId: this.imp._id } }
    };
    this.shipment = shipment;
    debug("shipment data %o", shipment);
    return this;
  }

  hasRows() {
    return this.rows && this.rows.length > 0;
  }

  get() {
    return { shipment: this.shipment, errors: this.errors };
  }
}
