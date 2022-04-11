import { CheckTenderSecurity } from "/imports/utils/security/checkUserPermissionsForTender";
import { Tender } from "/imports/api/tenders/Tender";
import { Random } from "/imports/utils/functions/random.js";
import SecurityChecks from "/imports/utils/security/_security";

import {
  getDetails,
  groupByLaneRoot,
  groupPackages,
  scopeDef,
  sortPackages
} from "/imports/api/scope/services/_pipelineBuilder";

const debug = require("debug")("tenders:mutation");

export const generateTenderPackages = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tenderId = tenderId;
    this.tender = await Tender.first(tenderId);
    SecurityChecks.checkIfExists(this.tender);

    if (!this.tender.scope)
      throw new Meteor.Error(
        "no scope",
        "There is no scope defined to build a package"
      );

    this.security = new CheckTenderSecurity(
      { tender: this.tender },
      { userId: this.userId, accountId: this.accountId }
    );
    await this.security.getUserRoles();
    this.security.init();
    debug(
      "security audit: role: %o; owner account: %s",
      this.security.role,
      this.tender.accountId
    );
    this.security.can({ action: "generatePackages" }).throw();
    return this;
  },
  async generate() {
    debug("build package for tenderid %o", this.tenderId);

    // 0. purpose: this method generates a summary of the scope & adds it in packages
    // 1. step1: tender Scope details -> get Data
    // 2. step2: group to packages (remember that the scope group is per volumeRange, etc)
    //			we just summarize by lanes here as a high level overview
    // future enhancements: bid groups per combination of lane, equipment and DG??

    // reset the packages:
    await this.tender.update_async({
      packages: [],
      "activity.generateScope": true
    });

    // access control: only tender mgr and owner can run this!
    const pipeline = [];
    scopeDef(pipeline, {
      documentId: this.tenderId,
      root: "tenderId"
    });
    getDetails(pipeline, {
      documentId: this.tenderId,
      root: "tenderId",
      detailsCollection: "tenders.details",
      getLocDef: true
    });
    groupByLaneRoot(pipeline);
    groupPackages(pipeline, {});
    sortPackages(pipeline);

    // let tempIds = []; // helper for unique ids
    debug("pipeline: db.getCollection('tenders').aggregate( %j );", pipeline);

    const res = await Tender._collection.aggregate(pipeline);
    const packages = res.map(doc => {
      doc.bidGroups = (doc.bidGroups || []).map(group => {
        // unique id -> werkt niet??
        // while !group.id || ( tempIds.indexOf(group.id) != -1 )
        group.id = Random.id(6);

        // tempIds.push group.id
        return group;
      });
      return doc;
    });

    debug("packages: %o", (packages || []).length);

    // TODO [#153]: reset bidder's answers to [] as the ids have changed!!
    await this.tender.update_async({
      packages,
      "activity.generateScope": false
    });
    return this;
  },
  async getUIResponse() {
    return this.tender.reload();
  }
});
