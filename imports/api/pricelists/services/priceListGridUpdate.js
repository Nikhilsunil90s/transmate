import SecurityChecks from "/imports/utils/security/_security.js";
import pick from "lodash.pick";
import dot from "dot-object";

// import { NpmModuleMongodb as MongoDB } from "meteor/npm-mongo";
// import get from "lodash.get";

import { PriceListRate } from "../PriceListRate";
import { PriceList } from "../PriceList";
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate";

const debug = require("debug")("price-list:method");

// important note: if we do an update with rawCollection and we rely on ObjectId, use the npm module!!

export const priceListGridUpdate = ({ accountId, priceListId }) => ({
  accountId,
  priceListId,

  async runChecks() {
    this.priceList = await PriceList.first(this.priceListId, {
      fields: { _id: 1, charges: 1, volumes: 1 } // charges, volumes needed for structure check
    });
    SecurityChecks.checkIfExists(this.priceList);
    return this;
  },
  prioritizeUpdates({ updates = [] }) {
    this.cellUpdates = updates.filter(update => !update.isHeader);
    this.headerUpdates = updates.filter(update => update.isHeader);
    return this;
  },

  async runCellUpdates() {
    if (this.cellUpdates.length > 0) {
      const bulkPriceListRateOp = PriceListRate._collection
        .rawCollection()
        .initializeUnorderedBulkOp();

      this.cellUpdates.forEach(({ selector, update }) => {
        const dotSelector = dot.dot(selector);
        if (!update) {
          // deleting if update is empty
          bulkPriceListRateOp
            // eslint-disable-next-line no-underscore-dangle
            .find({
              ...dotSelector,
              "meta.source": "table",
              priceListId: this.priceListId
            })
            .delete();
        } else {
          // upserting new rate
          // we are using the simple schema to make sure all values are correctly saved
          // strip priceListId form update object
          const { id: ommittedID, priceListId: ommittedPLID, ...cleanUpdate } =
            update || {};

          const modifier = PriceListRateSchema.clean(
            { $set: cleanUpdate },
            {
              trimStrings: true,
              getAutovalues: false,
              isModifier: true,
              mutate: true
            }
          );

          debug(
            "bulkPriceListRateOp %s, update %j",
            selector.id,
            modifier.$set
          );

          bulkPriceListRateOp
            // eslint-disable-next-line no-underscore-dangle
            .find({
              ...dotSelector,
              "meta.source": "table",
              priceListId: this.priceListId
            })
            .upsert()
            .updateOne(modifier);
        }
      });

      try {
        const { result = {} } = await bulkPriceListRateOp.execute();
        this.cellUpdateResults = pick(result, [
          "ok",
          "nMatched",
          "nModified",
          "nUpserted",
          "nInserted",
          "nRemoved"
        ]);
        debug(this.cellUpdateResults);
      } catch (err) {
        debug(err);
        this.cellUpdateErrors = "Error updating price list rates";
      }
    }

    return this;
  },

  /** mass updates after header change:
   * 1 build query based on rules: {}, rulesUI:{}
   * 2 check query is valid!!
   * 3 bulkop update
   */
  async runHeaderUpdates() {
    if (this.headerUpdates.length > 0) {
      const bulkPriceListRateOp = PriceListRate._collection
        .rawCollection()
        .initializeUnorderedBulkOp();

      this.headerUpdates.forEach(({ selector = {}, update }) => {
        const hasSelectorRules = Object.keys(selector.rules || {}).length > 0;
        const hasSelectorRulesUI =
          Object.keys(selector.rulesUI || {}).length > 0;

        if ((hasSelectorRules || hasSelectorRulesUI) && update) {
          // mass updating all the underlying rate fields
          const query = { priceListId: this.priceListId };

          if (hasSelectorRules) {
            query.rules = { $all: [] };
            Object.entries(selector.rules || {}).forEach(([k, v]) => {
              query.rules.$all.push({ $elemMatch: { [k]: v } });
            });
          }

          if (hasSelectorRulesUI) {
            query.rulesUI = selector.rulesUI;
          }

          debug("bulkPriceListRateOp %o", { selector, update, query });

          bulkPriceListRateOp.find(query).update({ $set: update });
        }
      });

      try {
        const { result = {} } = await bulkPriceListRateOp.execute();
        debug("bulkPriceListRateOp result %o", { result });
        this.headerUpdateResults = pick(result, [
          "ok",
          "nMatched",
          "nModified",
          "nUpserted",
          "nInserted",
          "nRemoved"
        ]);
      } catch (err) {
        debug("Error updating price", err);
        this.headerUpdateErrors = "Error updating price list header";
      }
    }

    return this;
  },
  async runTemplateStructureUpdates() {
    if (this.headerUpdates.length > 0) {
      const priceListUpdates = {};
      this.headerUpdates.forEach(({ selector = {}, update = {} }) => {
        const keys = { ...selector.rules, ...selector.rulesUI };
        debug({ keys, update });

        Object.keys(update).forEach(k => {
          if (["amount.currency", "multiplier"].includes(k)) {
            // can be stored in charges or in volume group
            const dbKey = k === "amount.currency" ? "currency" : k;

            if (keys.chargeId) {
              const chargeIndex = (this.priceList.charges || []).findIndex(
                charge => charge.id === keys.chargeId
              );
              if (chargeIndex > -1) {
                priceListUpdates[`charges.${chargeIndex}.${dbKey}`] = update[k];
              }
            }
            if (keys.volumeGroupId && keys.volumeChargeId) {
              const volumeGroupIndex = (this.priceList.volumes || []).findIndex(
                volumeGroup => volumeGroup.id === keys.volumeGroupId
              );
              if (volumeGroupIndex > -1) {
                const volumeRangeIndex = (
                  this.priceList.volumes[volumeGroupIndex].ranges || []
                ).findIndex(
                  volumeRange => volumeRange.id === keys.volumeRangeId
                );
                if (volumeGroupIndex > -1) {
                  priceListUpdates[
                    `volumes.${volumeGroupIndex}.ranges.${volumeRangeIndex}.${dbKey}`
                  ] = update[k];
                }
              }
            }
          }
        });
      });
      if (Object.keys(priceListUpdates).length > 0) {
        await PriceList._collection.update(
          { _id: this.priceListId },
          { $set: priceListUpdates }
        );
      }
    }
    return this;
  },
  getResults() {
    return {
      results: {
        cellUpdate: this.cellUpdateResults,
        headerUpdate: this.headerUpdateResults
      },
      errors: {
        cellUpdate: this.cellUpdateErrors,
        headerUpdate: this.headerUpdateErrors
      }
    };
  }
});
