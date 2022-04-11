/* eslint-disable no-use-before-define */
import { Meteor } from "meteor/meteor";
import SecurityChecks from "/imports/utils/security/_security";
import { Address } from "/imports/api/addresses/Address";
import { Location } from "/imports/api/locations/Location";
import { selectScopeCollection } from "./_setCollections";

import { oPath } from "/imports/utils/functions/path";

const debug = require("debug")("scope:methods");

const rounder = el => {
  if (el > 1000) {
    return `${el / 1000}k`;
  }
  return el;
};

class ScopeCopyService {
  constructor() {
    this.newScope = {};
  }

  async getReferenceDoc({ referenceId, referenceType }) {
    this.referenceId = referenceId;
    this.referenceType = referenceType;

    // collection where to copy from...
    const { collection, queryKey = "_id", fields } = selectScopeCollection(
      referenceType
    );
    this.referenceDoc = await collection.first(
      { [queryKey]: referenceId },
      fields
    );

    // verify if doc exists & throw error
    SecurityChecks.checkIfExists(this.referenceDoc);
    return this;
  }

  copyFromPriceList() {
    // 0. purpose: get scope from a priceList based on the definition
    // 1. scope definition parameters:
    // [lane, equipment, serviceLevel, 'goods.DG', 'goods.class', 'incoterm']

    const def = [];
    const scope = {};
    scope.lanes = this.referenceDoc.lanes;

    if (this.referenceDoc.equipments) {
      scope.equipments = this.referenceDoc.equipments;
      def.push("equipments");
    }

    // TODO [#145]: what if only a certain volume group should be taken?
    if (this.referenceDoc.volumes) {
      def.push("volumes");
      const volumes = this.referenceDoc.volumes.map(volumeDef => {
        volumeDef.ranges = (volumeDef.ranges || []).map(range => {
          range.name =
            range.name ||
            `${rounder(range.from)}-${rounder(range.to)} ${volumeDef.uom}`;
          return range;
        });
        return volumeDef;
      });
      scope.volumes = volumes;
    }
    scope.definition = def;
    scope.source = {
      type: "priceList",
      id: this.referenceDoc._id
    };
    this.newScope = scope;

    return this;
  }

  copy() {
    if (this.referenceType === "priceList") {
      this.copyFromPriceList();
      return this;
    }
    if (this.referenceDoc.scope) {
      const { scope } = this.referenceDoc;
      scope.source = {
        referenceId: this.referenceId,
        type: this.referenceType
      };
      this.newScope = scope;
      return this;
    }
    throw new Meteor.Error("scope", "No Scope definition found");
  }

  async enrichScope() {
    // get lane definition
    // 1 get all addressIds, locationIds
    // 2 get them fro the db
    // store them in the newScope
    const addressIds = [];
    const locationIds = [];
    (this.newScope.lanes || []).forEach(lane => {
      ["from", "to"].forEach(dir => {
        addressIds.concat(lane[dir].addressIds || []);
        locationIds.concat(lane[dir].addressIds || []);
      });
    });

    // get the data:
    const locations = await Location.where(
      { _id: { $in: locationIds } },
      {
        fields: {
          countryCode: 1,
          locationCode: 1,
          name: 1
        }
      }
    );
    const addresses = await Address.where(
      { _id: { $in: addressIds } },
      { fields: { countryCode: 1, zip: 1, street: 1 } }
    );

    // enrich
    (this.newScope.lanes || []).map(lane => {
      ["from", "to"].forEach(dir => {
        if (oPath([dir, "addressIds", "length"], lane) > 0) {
          lane[dir].address = addresses.filter(({ _id }) =>
            lane[dir].addressIds.includes(_id)
          );
        }
        if (oPath([dir, "locationIds", "length"], lane) > 0) {
          lane[dir].location = locations.filter(({ _id }) =>
            lane[dir].locationIds.includes(_id)
          );
        }
      });
      return lane;
    });
    return this;
  }

  checkNewScope() {
    if (Object.keys(this.newScope).length === 0)
      throw new Meteor.Error(
        "We could not generate a scope from the reference document"
      );
    return this;
  }

  async toMasterDoc({ masterType, masterId }) {
    this.masterType = masterType;
    this.masterId = masterId;

    debug(
      "toMasterDoc: masterType %s, masterId: %s, %O",
      masterType,
      masterId,
      this.newScope
    );
    const { collection: masterCol, queryKey = "_id" } = selectScopeCollection(
      masterType
    );
    await masterCol._collection.update(
      { [queryKey]: masterId },
      { $set: { scope: this.newScope } }
    );

    return this;
  }

  get(item = "newScope") {
    return this[item];
  }
}

export { ScopeCopyService };
