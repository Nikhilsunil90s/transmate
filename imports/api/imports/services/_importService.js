import get from "lodash.get";
import AJV from "ajv";

// collections:
import { ImportMapping } from "/imports/api/imports/Import-mapping";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { Import } from "/imports/api/imports/Import-shipments";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import shipmentSchema from "/imports/api/_jsonSchemas/restAPI/shipment.json";
import itemSchema from "/imports/api/_jsonSchemas/restAPI/items.json";

import { ImportProcesser } from "/imports/api/imports/services/shipmentImportProcesser";

const debug = require("debug")("imports:mapping");

const MINIMAL_ROOT_KEYS = [
  "shipment.references.number",

  // FIXME: temp disable >>
  // "item.quantity",
  // "item.quantity_unit",
  "stage.to",
  "stage.from"
];

export const importService = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId, imp }) {
    this.imp = imp || (await Import.first(importId));
    this.importId = importId || this.imp.id;
    this.account = await AllAccounts.first(this.accountId);
    return this;
  },

  async importValues({ header }) {
    const key = `data.${Import.mongoKey(header)}`;
    let values = await EdiRows.rawCollection().distinct(key, {
      importId: this.importId
    }); // return [] with distinct values
    values = values.filter(val => !!val);
    const delimiter = "|";
    values = values.reduce(
      (acc, vals) => acc.concat(vals.split(delimiter)),
      []
    );
    values = [...new Set([...values])];
    const updates = {};

    values.forEach(v => {
      const prop = `mapping.values.${Import.mongoKey(header)}.${Import.mongoKey(
        v
      )}`;
      if (!get(this.imp, prop)) {
        updates[prop] = null;
      }
    });
    if (Object.keys(updates).length) {
      try {
        await this.imp.update_async(updates);
      } catch (error) {
        throw new Error("import.values.mongo", error);
      }
    }
    return values;
  },

  // eslint-disable-next-line consistent-return
  async mapHeader({ header, key }) {
    // check if the key hasn't been mapped yet!
    const test = Object.values(
      get(this.imp, ["mapping", "headers"]) || {}
    ).includes(key);

    if (test && key !== "ignore")
      throw new Error("mapping-error: This Field has already been mapped");
    try {
      debug("update mapping db with %o", { header, key });

      await this.mapImportFields({ header, key });

      if (Import.fieldOptions(key).length) {
        await this.importValues({ header });
      } else {
        await this.imp.del_async(`mapping.values.${Import.mongoKey(header)}`);
      }
    } catch (e) {
      console.error(e);
      return e;
    }
    return this;
  },

  async mapValue({ header, importValue, systemValue }) {
    const updates = {};
    updates[
      `mapping.values.${Import.mongoKey(header)}.${Import.mongoKey(
        importValue
      )}`
    ] = systemValue;
    await this.imp.update_async(updates);

    // Update the general mapping document, so the system can learn over time
    ImportMapping._collection.upsert(
      {
        accountId: this.account._id,
        type: this.imp.type
      },
      {
        $set: {
          [`values.${Import.mongoKey(header)}.${Import.mongoKey(
            importValue
          )}`]: systemValue
        }
      }
    );
  },

  async mapImportFields({ header, key }) {
    // 0. store mapping in edi_imports
    // 1. store mapping in edi_mapping
    // 2. return import/error

    let result = {};
    try {
      const updates = {};
      const cleanKey = Import.mongoKey(header);
      updates[["mapping", "headers", cleanKey].join(".")] = key;
      debug("update mapping db with %o", updates, header, key);

      const numHeaders = this.imp.headers.length;
      const numMapped = get(this.imp, ["mapping", "headers"])
        ? Object.keys(this.imp.mapping.headers).length
        : 0;
      updates["progress.mapping"] = Math.round((numMapped / numHeaders) * 100);

      // Update the general mapping document, so the system can learn over
      result = await this.imp.update_async(updates);
      debug("update mapping result %o", result);
      await ImportMapping._collection.upsert(
        { accountId, type: this.imp.type },
        { $set: { [["headers", cleanKey].join(".")]: key } }
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
    return result;
  },

  async checkValidationErrors() {
    // 0 check with required fields & see if these are in:
    // 1 if initial test passes, run check on first n records
    await this.imp.reload();
    const tgtHeadersArr = Object.values(
      get(this.imp, ["mapping", "headers"], {})
    );
    const missing = MINIMAL_ROOT_KEYS.reduce((acc, key) => {
      let hasMatch;
      let i = 0;
      while (i < tgtHeadersArr.length && !hasMatch) {
        hasMatch = !!(tgtHeadersArr[i] || "").match(new RegExp(`^${key}`));
        i += 1;
      }
      if (!hasMatch) {
        acc.push({
          error: "missingMap",
          message: `please add mapping to field: ${key}`
        });
      }
      return acc;
    }, []);

    let errors = [];

    if (missing.length) {
      errors = missing;
    } else {
      const ajv = new AJV({
        allErrors: true,
        coerceTypes: true,
        useDefaults: true,
        format: "full"
      });

      // mount AJV schema + items
      const validateShipment = ajv
        .addSchema(itemSchema)
        .compile(shipmentSchema);

      const cursor = await EdiRows.find({ importId: this.importId });
      const impDataCount = await cursor.count();
      debug("check if there is data now example %o", impDataCount);
      if (impDataCount > 0) {
        // check with ajv! first row
        debug("setup importprocesser");
        const importProcess = new ImportProcesser({
          accountId: this.accountId
        });
        await importProcess.init({ imp: this.imp });

        const {
          shipment,
          errors: dataPrepErrors
        } = importProcess.prepareShipmentData().get();

        debug("example shipment %j", shipment);
        if (Array.isArray(dataPrepErrors) && dataPrepErrors.length > 0) {
          errors = dataPrepErrors.map(error => {
            return { message: error.message };
          });
        }

        // console.dir(shipment, { depth: null });

        if (!validateShipment(shipment)) {
          debug("errors validation! %j", validateShipment.errors);
          validateShipment.errors.forEach(schemaError => {
            const errorPath = schemaError.dataPath.replace(/\./g, "->");
            const errorTxt = `Shipment data ${schemaError.message}`;
            errors.push({
              error: "mapping",
              message: `${errorTxt} on ${errorPath}`
            });
          });
        }
      } else {
        errors.push({ error: "noRows", message: "Import has no valid rows" });
      }
    }

    this.errors = errors;
    await this.imp.update_async({ errors });
    return this;
  },

  getUIResponse() {
    return this.imp.reload();
  }
});
