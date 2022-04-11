import SecurityChecks from "/imports/utils/security/_security";

// collections
import { TenderBidMapping } from "../TenderBidMapping";
import { Settings } from "/imports/api/settings/Settings";

// data:

const debug = require("debug")("tenderBid:mapping");

// const debugSrv = require("debug");
export const editTenderBidMapping = ({ accountId, userId }) => ({
  accountId,
  userId,
  dbUpdate: {},
  mappingKeys: [],
  async init({ mappingId }) {
    this.mappingId = mappingId;
    this.tenderBidMap = await TenderBidMapping.first({ _id: mappingId });
    SecurityChecks.checkIfExists(this.tenderBidMap);

    // get settings:
    const settings = await Settings.first("tenderify-map", {
      fields: { mappingKeys: 1 }
    });
    this.mappingKeys = settings.mappingKeys || [];
    return this;
  },

  //#region internal fn:
  updateHeaderMap(headerUpdate) {
    // headerUpdate = {"10": {origin:<>, target:<>, updated: true}}
    const dbUpdate = {};
    Object.entries(headerUpdate).forEach(([k, v]) => {
      dbUpdate[`mappingH.${k}`] = { ...v, updated: true };
    });
    this.dbUpdate = {
      ...this.dbUpdate,
      ...dbUpdate
    };
    return this;
  },

  updateValueMap({ key, updates }) {
    // mappingupdate = { key, updates: [{index, prop, value}]}
    const dbUpdate = {};
    updates.forEach(({ originId, colKey, value }) => {
      dbUpdate[`mappingV.${key}.data.${originId}.${colKey}`] = value;
      dbUpdate[`mappingV.${key}.data.${originId}.updated`] = true;
    });
    this.dbUpdate = {
      ...this.dbUpdate,
      ...dbUpdate
    };

    return this;
  },

  updateFieldMap(fieldMap) {
    // mappingF update: { <key> : [ {o: <>, t:<>, store:"file"}]}
    const dbUpdate = {};
    this.newFieldMaps = {};
    Object.entries(fieldMap).forEach(([fieldKey, mappings]) => {
      // key is a fieldKey, for some items we store a groupKey -> look that up first!
      // lookup a groupKey:
      const col = this.mappingKeys.find(({ k }) => k === fieldKey) || {};
      const groupKey = col.mappingFunction || fieldKey;

      // we need unique values in the array -> preFilter!
      let dbMappings = this.tenderBidMap?.mappingF?.[groupKey] || [];
      mappings.forEach(map => {
        // pre-filter
        dbMappings = dbMappings.filter(({ o }) => o !== map.o);

        // add new if not ignore:
        if (map.store && map.store !== "ignore") {
          this.newFieldMaps[fieldKey] = [].concat(
            this.newFieldMaps[fieldKey] || [],
            map
          );
          dbMappings.push(map);
        }
      });

      dbUpdate[`mappingF.${groupKey}`] = dbMappings;
    });

    this.dbUpdate = {
      ...this.dbUpdate,
      ...dbUpdate
    };
    return this;
  },

  async saveToDB() {
    debug("saving to db: %o", this.dbUpdate);
    await this.tenderBidMap.update_async(this.dbUpdate);
    return this;
  },
  //#endregion

  async update({ update }) {
    // check all updates and perform actions:
    Object.keys(update).forEach(k => {
      // eslint-disable-next-line default-case
      switch (k) {
        case "mappingH":
          this.updateHeaderMap(update[k]);
          break;
        case "mappingV":
          // mappingV: { key, updates: [ { originId, colKey, value}]}
          // mappingV: { key: "lanes", updates: [ { originId: 0, colKey: "target_lanesFromCountry", value: "..."}]}
          this.updateValueMap(update[k]);
          break;
        case "mappingF":
          this.updateFieldMap(update[k]);
          break;
      }
    });

    await this.saveToDB();
    return this;
  },

  runPostActions() {
    // if user has stored new fieldMappings, we need to rerun on the mappingV again for optimistic UI..
    // note: the mapping function will overwrite this once triggered;

    // note: we need to wait for the next Meteor release (1.10) -> the node mongo driver needs to be updated!!
    // arrayFilters was a bug in the current mongodb driver :(
    /*
    // bulk operation:
    const bulkOp = TenderBidMapping._collection
      .rawCollection()
      .initializeUnorderedBulkOp();
    bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);

    Object.entries(this.newFieldMaps).forEach(([fieldKey, { o, t }]) => {
      // fieldMap: {o: <> , t: <>}
      // parent of the field:
      const col = mappingKeys.find(({ k }) => k === fieldKey) || {};
      const { parent, mappingFunction: group } = col;
      if (!parent) return;

      let fields;
      if (group) {
        fields = mappingKeys
          .filter(({ mappingFunction: g }) => g === group)
          .map(({ k }) => k);
      } else {
        fields = [fieldKey];
      }

      // we use an array filter -> if the array element matches, the update will be done on that item
      fields.forEach(field => {
        bulkOp
          .find({ _id: this.tenderBidMap._id })
          .arrayFilters([{ [`elem.origin.${field}`]: o }])
          .update({
            $set: { [`mappingV.${parent}.$[elem].target.${field}`]: t }
          });
      });
    });

    try {
      const res = bulkOp.executeAsync();
      console.dir(res, { depth: null });
    } catch (err) {
      console.dir(err, { depth: null });
    }
    */
    return this;
  },

  getUIResponse() {
    return this.tenderBidMap.reload();
  }
});
