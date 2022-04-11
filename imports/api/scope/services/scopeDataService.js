import { Meteor } from "meteor/meteor";
import get from "lodash.get";
import { Random } from "/imports/utils/functions/random.js";
import { bigQuery } from "@transmate-eu/bigquery_module_transmate";

import { ScopeService } from "/imports/api/scope/services/scopeService";
import SecurityChecks from "/imports/utils/security/_security";
import { setCollections } from "./_setCollections";

// import { getRandomInt } from "/imports/utils/functions/functions";

const debugM = require("debug");

const debug = debugM("scope:data");

const scopeNameGenerator = scope => {
  const DG = scope.goodsDGClass;
  const equipment = get(scope, ["equipments", "name"]);
  const rngName = get(scope, ["volumes", "ranges", "name"]);
  let name = get(scope, ["lanes", "name"]);
  name += rngName ? ` (${rngName})` : "";
  name += equipment ? ` eq:${equipment}` : "";
  name += scope.goodsDG != null ? ` - ${scope.goodsDG ? "DG" : "non-DG"}` : "";
  name += DG ? ` - ${DG}` : "";
  return name;
};
class ScopeDataService {
  async getMasterDoc({ masterId, masterType }) {
    const { collection, params, detailsCollection } = setCollections(
      masterType,
      masterId
    );

    this.masterId = masterId;
    this.masterType = masterType;
    this.masterDoc = await collection.first(
      { [params.queryKey]: masterId },
      { fields: params.fields }
    );
    SecurityChecks.checkIfExists(this.masterDoc);

    this.scopeDef = this.masterDoc.scope;
    this.params = params;
    this.detailsCollection = detailsCollection;
    this.data = []; // generated data

    return this;
  }

  async updateMasterDoc({ update }) {
    if (update) {
      debug("updating masterDocument: %o", update);
      await this.masterDoc.update(update);
    }
    return this;
  }

  async resetDetails() {
    await this.detailsCollection._collection.remove({
      [`${this.params.root}`]: this.masterId
    });
    return this;
  }

  async getScopeItems() {
    const sv = new ScopeService()
      .setCollections({ type: this.masterType, documentId: this.masterId })
      .scopeDef()
      .enrichScope();
    this.scopeItems = (await sv.aggregate()) || [];
    debug("found %s scope items", this.scopeItems.length);

    return this;
  }

  async copyDetailItems() {
    if (!get(this.masterDoc, ["scope", "source", "referenceId"]))
      throw new Error("No reference found to copy from");

    const { type, referenceId } = this.masterDoc.scope.source;
    const { detailsCollection, params } = setCollections(type, referenceId);

    const cursor = await detailsCollection.find({
      [`${params.root}`]: referenceId,
      deleted: { $ne: true }
    });
    this.data = await cursor.fetch();

    this.data = this.data.map(
      // eslint-disable-next-line camelcase
      ({ _id, id, __is_new, calculation, ...allAttributes }) => ({
        ...allAttributes,

        // link to the master doc:
        [`${this.params.root}`]: this.masterId
      })
    ); // little trick to drop keys

    debug("found %s items for %o", this.data.length, {
      [`${params.root}`]: referenceId
    });
    return this;
  }

  dataFromAggregation() {
    // placeholder -> if no big query -> query in mongo...
    return this;
  }

  async getDataFromBQ() {
    // TODO [#146]: big query is not taking query into account or DG ...
    try {
      this.dbData = await bigQuery.getScope({
        scopeDef: this.scopeDef,
        accountId: this.masterDoc.accountId
      });
    } catch (err) {
      throw new Meteor.Error(`Error while getting your data`, err);
    }
    return this;
  }

  mapDbData() {
    // perform matching of db data with the scope Groups:
    let precentFinished = 0;
    this.masterDoc.update({
      calculation: {
        status: "calculating",
        type: "Generating data from query",
        message: `${precentFinished}% complete`
      }
    });

    debug(
      "total scope options : %o and all scopes data  %o",
      this.scopeItems,
      this.data
    );
    const totalCount = this.scopeItems.length;
    this.scopeItems.forEach((scopeDef, cur) => {
      // perform query for each scope group
      const scopeIds = {
        ...(get(scopeDef, ["lanes", "id"]) && { laneId: scopeDef.lanes.id }),
        ...(get(scopeDef, ["volumes", "id"]) && {
          volumeGroupId: scopeDef.volumes.id
        }),
        ...(get(scopeDef, ["volumes", "ranges", "id"]) && {
          volumeRangeId: scopeDef.volumes.ranges.id
        }),
        ...(get(scopeDef, ["equipments", "id"]) && {
          equipmentId: scopeDef.equipments.id
        })
      };

      const summary = (this.dbData || []).find(scope => {
        // return matching scope quantities, match with null or with value
        return (
          scope.laneId === scopeIds.laneId &&
          scope.volumeGroupId === (scopeIds.volumeGroupId || null) &&
          scope.volumeRangeId === (scopeIds.volumeRangeId || null) &&
          scope.equipmentId === (scopeIds.equipmentId || null)
        );
      });

      debug("found data %o ", summary);

      if (summary) {
        // saveDetail
        this.data.push({
          [`${this.params.root}`]: this.masterId,
          ...scopeDef,
          ...scopeIds,
          name: scopeNameGenerator(scopeDef),

          quantity: {
            count: summary.count,
            amount: summary.amount,
            equipment: 1, // !!!! what to do here???????
            currentCost: summary.currentCost,
            leadTime: summary.leadTime
          },
          shipmentIds: summary.shipmentIds
        });

        // post some progress stats:
        if (Math.round((cur / totalCount) * 100) > precentFinished) {
          precentFinished = Math.round((cur / totalCount) * 100);
          this.masterDoc.update({
            "calculation.message": `${Math.round(
              (cur / totalCount) * 100
            )}% complete`
          });
        }
      }
    });
    return this;
  }

  dataFill() {
    // 0. get full scope
    // 1. for each scope group
    this.data = (this.scopeItems || []).map(scopeItem => {
      const volRngFrom = get(scopeItem, ["volumes", "ranges", "from"]);
      const volRngTo = get(scopeItem, ["volumes", "ranges", "to"]);
      const count = 1; // getRandomInt(0, 100);
      const amount =
        volRngFrom !== undefined ? (volRngTo - volRngFrom) / 2 + volRngFrom : 1;
      return {
        ...scopeItem,
        name: scopeNameGenerator(scopeItem),
        quantity: {
          count,
          amount,
          equipment: 1
        }
      };
    });
    return this;
  }

  async saveToDetailsCollection() {
    debug("Saving %s data items", this.data.length);
    let res = { results: { ok: true, nInserted: 0 } };

    // initialize bulkup:
    const bulkInsertDetailOp = this.detailsCollection._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    // insert all generated Data:
    let { data } = this;
    if (Array.isArray(data) && data.length > 0) {
      let retries = 0;

      do {
        try {
          data.forEach(item => {
            bulkInsertDetailOp.insert({ ...item, _id: Random.id() });
          });
          // eslint-disable-next-line no-await-in-loop
          res = await bulkInsertDetailOp.execute();
          debug("update details %o", res);
          data = [];
        } catch (e) {
          data = [];
          if (e && e.writeErrors) {
            retries += 1;

            // eslint-disable-next-line no-loop-func
            e.writeErrors.forEach(element => {
              // capture the duplicate key entries
              if (element.code === 11000) {
                data.push(element.getOperation());
              }
            });
          }
          console.warn("retry:", data);
        }
      } while (data.length > 0 && retries < 10);
    }

    await this.masterDoc.update({
      calculation: {
        status: "finished",
        result: `${this.data.length} matching scope groups found`
      }
    });

    const { ok, nInserted, nUpserted, nModified, nRemoved } = res.results || {};
    this.detailsStats = { ok, nInserted, nUpserted, nModified, nRemoved }; // gives stats
    return this;
  }

  set(item) {
    Object.entries(item).forEach(([k, v]) => {
      this[k] = v;
    });
    return this;
  }

  get(item) {
    return this[item];
  }
}

export { ScopeDataService };
