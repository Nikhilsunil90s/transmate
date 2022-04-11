import pick from "lodash.pick";
import { JobManager } from "../../../utils/server/job-manager.js";
import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";
import { accountGetProfileService } from "/imports/api/allAccounts/services/accountGetProfile";

const debug = require("debug");

export const tenderService = ({ userId, accountId }) => ({
  userId,
  accountId,
  success: {},
  errors: [],
  init({ tender }) {
    this.tender = tender;
    return this;
  },

  reset() {
    // remove all existing quantity fields in the detail table
    TenderDetail._collection.remove({ tenderId: this.tender._id });
    try {
      // remove all bids that were placed (ids are refreshed now...)
      Tender._collection.rawCollection().update(
        {
          _id: this.tender._id,
          bidders: {
            $exists: true
          }
        },
        {
          $set: {
            "bidders.$[].bids": [],
            updated: ByAtSchema.clean({})
          },
          $unset: {
            packages: null
          }
        },
        {
          /* multi: true, */

          validate: false,
          bypassCollection2: true
        }
      );
    } catch (error) {
      throw new Error("tender.update.remove-bids", error.reason);
    }
  },

  getScopDefs({ topic, searchId }) {
    // equipments/ lanes/ volumes
    return (this.tender.scope[topic] || []).find(({ id }) => id === searchId);
  },
  async saveDetails({ updates }) {
    const bulkOp = TenderDetail._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    updates.forEach(({ item, update }) => {
      const qtyUpdate = {};
      Object.entries(update).forEach(([k, v]) => {
        qtyUpdate[`quantity.${k}`] = v;
      });
      const name = item.name || update.name;

      bulkOp
        .find({
          tenderId: item.tenderId,
          accountId,
          laneId: item.laneId,
          volumeGroupId: item.volumeGroupId,
          volumeRangeId: item.volumeRangeId,
          goodsDG: item.goodsDG,
          equipmentId: item.equipmentId
        })
        .upsert()
        .updateOne({
          $set: {
            name,
            shipmentIds: update.shipmentIds,
            updated: ByAtSchema.clean({}),

            // // de-normalize
            // lanes: itemMod.lanes,
            // volumes: itemMod.volumes,
            // equipments: itemMod.equipments,

            // quantties:
            ...qtyUpdate
          }
        });
    });

    try {
      const { result = {} } = await bulkOp.execute();

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

    // what to do whith this?
    // this.tender.del("packages");
    return this.tender;
  },

  /**
   * allows to add/remove a bidder & perform some checks
   * add a bidder: if status is already in requested -> trigger mail hook
   * remove a bidder: if status is already in requested -> notification??
   * @param {String} action [add, remove]
   * @param {[String]} partnerIds partnerIds after the update -> sort out what to remove/ add
   * @param {String=} name partner name to add
   */
  async addRemoveBidders({ partnerIds: newPartnerIds }) {
    if (!this.accountId) {
      throw Error("accountId must be set!");
    }
    debug("addRemoveBidders", { newPartnerIds });
    const currentBidderIds = (this.tender.bidders || []).map(
      ({ accountId: id }) => id
    );
    debug({ currentBidderIds });

    // make unique to avoid issues (adding 2x same carrier)
    const newPartnersUniqueIds = [...new Set(newPartnerIds || [])];
    const { status } = this.tender;

    const bidderIdsToAdd = newPartnersUniqueIds.filter(
      id => !currentBidderIds.includes(id)
    );
    const biddersToRemove = (this.tender.bidders || []).filter(
      ({ accountId: id }) => !newPartnersUniqueIds.includes(id)
    );

    // actions for adding partners:
    debug({ bidderIdsToAdd });
    try {
      await Promise.all(
        bidderIdsToAdd.map(
          partnerId =>
            new Promise(resolve => {
              const { name, contacts } = accountGetProfileService({
                accountId: partnerId,
                myAccountId: this.accountId
              })
                .getAccountDoc()
                .getNameAndContacts();

              this.tender.push({
                bidders: { accountId: partnerId, name, contacts }
              });

              if (["open"].includes(status)) {
                // retrigger notification hook
                debug(
                  "send notification for price request %s ,  %o",
                  this.tender._id,
                  { partnerId, name }
                );
                JobManager.post("tender.open", this.tender);
              }
              resolve();
            })
        )
      );
    } catch (e) {
      this.errors.push("issue while adding bidders");
    }

    let removeCount = 0;
    debug({ biddersToRemove });

    // actions to remove partner:
    biddersToRemove.forEach(({ accountId: partnerId, bid }) => {
      if (["open"].includes(status) && bid) {
        this.warnings.push({
          partnerId,
          warnings: "Partner has already placed a bid"
        });
      }
      if (["open"].includes(status)) {
        // retrigger notification hook
        debug("send notification for price request %s ,  %o", this.tender._id, {
          partnerId
        });
        JobManager.post("tender.cancelled", {
          tender: this.tender,
          partnerId
        });
      }
      debug("pull partner %s", partnerId);
      this.tender.pull({ bidders: { accountId: partnerId } });
      removeCount += 1;
    });

    // if the status is requested, we need to update access, otherwise, no need to set access as there should be none
    this.success.accountsAdded = bidderIdsToAdd.length;
    this.success.accountsRemoved = removeCount;
    return this;
  }
});
