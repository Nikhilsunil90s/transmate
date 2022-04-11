import get from "lodash.get";
import dot from "dot-object";
import stringSimilarity from "string-similarity";

import { importService } from "./_importService";
import { getItemTypes } from "/imports/api/allAccounts/services/query.getItemTypes";
import SecurityChecks from "/imports/utils/security/_security";

// collections:
import { Address } from "/imports/api/addresses/Address";
import { ImportMapping } from "/imports/api/imports/Import-mapping";
import { Import } from "/imports/api/imports/Import-shipments";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { importLookupFields } from "/imports/api/imports/helpers/importFields";

const debug = require("debug")("imports:import-data");

export const initializeMapping = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId, imp }) {
    this.imp = imp || (await Import.first(importId));
    this.importId = this.imp.id;
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },

  /** @param {string=} force if true, will redo mapping lookup, independently of status*/
  async initializeMapping(force) {
    const { imp } = this;
    debug(
      "mapping found, skipping initialization? %s",
      imp.progress.lookup && !force
    );
    if (imp.progress.lookup && !force) return imp.mapping;

    const updates = { progress: { data: 100, lookup: 100 } };

    // have we got a similar mapping in the db?
    const history = await ImportMapping.first({
      accountId: this.accountId,
      type: imp.type
    });
    updates.mapping = { headers: {}, values: {}, samples: {} };

    if (history) {
      await Promise.all(
        (imp.headers || []).map(async header => {
          if (history.headers[header] && history.headers[header] !== "") {
            updates.mapping.headers[header] = history.headers[header];

            if (Import.fieldOptions(history.headers[header])) {
              const srv = importService({ accountId, userId });
              await srv.init({ imp: this.impr });
              srv.importValues({ header });
            }

            if (get(history, ["values", "header"])) {
              updates.mapping.values[header] = history.values[header];
            }
          }
        })
      );
    }

    // suggest best match
    const importFieldKeyArray = Object.keys(importLookupFields);
    debug(
      "import fields to look in for match %o to array %o",
      importLookupFields,
      importFieldKeyArray
    );
    await Promise.all(
      imp.headers.map(async header => {
        //#region match header with field
        // look through each header, if header has no historic value lets find one
        if (!updates.mapping.headers[header]) {
          const match = stringSimilarity.findBestMatch(
            header
              .toLowerCase()
              .replace(/[^a-z0-9]/g, " ")
              .replace("postal", "zip"),
            importFieldKeyArray
          );
          debug(
            "%s to match %o",
            header.toLowerCase().replace(/[^a-z0-9]/g, " "),
            match.bestMatch
          );
          if (
            match.bestMatch &&
            match.bestMatch.target &&
            match.bestMatch.rating > 0.3
          ) {
            // return best matching header
            updates.mapping.headers[header] =
              importLookupFields[match.bestMatch.target];

            // remove key from list
            importFieldKeyArray.slice(match.bestMatchIndex, 1);
            debug(
              "header match %o results in %o, with end field %s",
              header,
              match.bestMatch.target,
              importLookupFields[match.bestMatch.target]
            );
          } else {
            // no match found
            updates.mapping.headers[header] = "ignore";
          }
        }
        //#endregion

        //#region valueMapping autoMatch:
        // field with values and check if no value mapped history
        /** @type {Array<{value: string, text: string}} */
        let fieldOptions = Import.fieldOptions(updates.mapping.headers[header]);

        // if quantity unit >> lookup options in settings and assing to fieldOptions
        if (
          typeof fieldOptions === "string" &&
          fieldOptions === "quantityUnit"
        ) {
          fieldOptions = (
            await getItemTypes({ accountId }).get({ includeBaseUOMS: true })
          ).map(({ code }) => ({ value: code, text: code }));
        }

        // if country >> lookup options in settings and assing to fieldOptions
        if (
          typeof fieldOptions === "string" &&
          fieldOptions === "countryCode"
        ) {
          fieldOptions = Address.countryCodes().map(({ name, code }) => ({
            value: code,
            text: name
          }));
        }

        if (Array.isArray(fieldOptions) && fieldOptions.length) {
          // build list of values
          let values = [];

          // values mappings are stored as: values: {headerString: {[k]:v}}
          if (!updates.mapping.values[header]) {
            updates.mapping.values[header] = {};

            // set keys if it does not exist yet (no history)
            const srv = importService({ accountId, userId });
            await srv.init({ imp: this.imp });
            values = await srv.importValues({ header });
          }

          values.forEach(value => {
            debug(
              "lets find a solution for value %s and matched to %o",
              value,
              fieldOptions
            );

            // create array of string values
            const fieldArray = fieldOptions
              .filter(({ text }) => !!text)
              .map(el => el.text.toLowerCase().replace(/[^a-z0-9]/g, " "));
            const match = stringSimilarity.findBestMatch(
              value.toLowerCase().replace(/[^a-z0-9]/g, " "),
              fieldArray
            );
            debug("%s to match %o", value, match, match.bestMatchIndex);

            // return match if goog match
            if (match.bestMatch.rating > 0.5) {
              updates.mapping.values[header][value] =
                fieldOptions[match.bestMatchIndex].value;
            }
          });
        }
        //#endregion
      })
    );

    // add samples
    const cursor = await EdiRows.find(
      { importId: this.importId },
      { limit: 3 }
    );
    const rows = await cursor.fetch();
    imp.headers.forEach(header => {
      updates.mapping.samples[header] = rows.map(({ data }) => data[header]);
    });

    // Update mapping progress
    const numHeaders = imp.headers.length;
    const numMapped = updates.mapping.headers
      ? Object.keys(updates.mapping.headers).length
      : 0;
    updates.progress.mapping = Math.round((numMapped / numHeaders) * 100);
    debug("update import doc %j", imp);
    await imp.update_async(dot.dot(updates));
    return this;
  },
  async checkValidationErrors() {
    const srv = importService({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.init({ imp: this.imp });
    await srv.checkValidationErrors();
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
