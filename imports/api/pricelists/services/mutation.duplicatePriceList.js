import { JobManager } from "../../../utils/server/job-manager.js";
import moment from "moment";
import pick from "lodash.pick";
import SecurityChecks from "/imports/utils/security/_security.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import { PriceList } from "../PriceList";
import { PriceListRate } from "../PriceListRate";
import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList.js";

const BASE_FIELDS_TO_COPY = [
  "base",
  "creatorId",
  "customerId",
  "carrierId",
  "template",
  "title",
  "currency",
  "category",
  "type",
  "mode",
  "validFrom",
  "validTo",
  "uoms",
  "lanes",
  "volumes",
  "equipments",
  "leadTimes",
  "charges",
  "defaultLeadTime",
  "notes",

  // 'attachments'
  "specialRequirements",
  "terms",
  "fuelIndexId",
  "carrierName",
  "summary"
];

export const duplicatePriceList = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first({ _id: priceListId });
    SecurityChecks.checkIfExists(this.priceList);
    return this;
  },
  async runChecks() {
    // check security if copying in OWN account (not if used in tender)
    const check = new CheckPriceListSecurity(
      {
        priceList: this.priceList
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "duplicatePriceList" }).throw();
    return this;
  },
  async duplicate({ rates, overrides }) {
    // check:
    // allowed to copy rules:
    // I can copy if I am one of the accounts ['carrierId','customerId','creatorId']
    // I can copy any if the copyToOtherAccountFlag is on
    if (
      !(
        this.priceList.carrierId === accountId ||
        this.priceList.customerId === accountId ||
        (overrides != null ? overrides.copyToOtherAccount : undefined)
      )
    )
      throw new Error(
        "Not-allowed",
        "You are not allowed to copy this priceList"
      );

    let copy = pick(this.priceList, BASE_FIELDS_TO_COPY);
    if (copy.title) {
      copy.title += " copy";
    } else {
      copy.title = `New PriceList ${moment().format("YYYY-MM-DD ")}`;
    }
    if (overrides != null ? overrides.copyToOtherAccount : undefined) {
      if (AllAccounts.getType(accountId) === "carrier") {
        // I am a carrier ->
        copy.carrierId = accountId; // I am not a carrier ->
      } else {
        // creatorId is the one that originally made it.
        copy.customerId = accountId;
      }
    }

    // overrides std values with data.
    if ((overrides || {}).data) {
      copy = Object.assign(copy, overrides.data);
    }
    copy.updates = [
      {
        action: "created",
        userId: this.userId,
        accountId: this.accountId,
        ts: new Date()
      }
    ];
    copy.updated = {
      by: this.userId,
      at: new Date()
    };
    copy.created = copy.updated;

    // Create while bypassing Collection2, otherwise large documents will cause
    // the method to hang
    copy = await PriceList.before_create_async(copy, { accountId, userId });
    const copyId = await PriceList._collection.insert(copy, {
      bypassCollection2: true
    });

    if (rates) {
      const bulkOp = PriceListRate._collection
        .rawCollection()
        .initializeOrderedBulkOp();
      const cursor = await PriceListRate._collection.find({
        priceListId: this.priceListId
      });

      let count = 0;

      // eslint-disable-next-line no-restricted-syntax
      for await (const doc of cursor) {
        const { _id: orgId, ...rate } = doc;
        bulkOp.insert({ ...rate, priceListId: copyId });
        count += 1;
      }

      if (count > 0) {
        await bulkOp.execute();
      }
    }

    // call pricelist and do normal meteor update to trigger before/after save
    this.newPriceList = await PriceList.first({ _id: copyId });
    await this.newPriceList.updateHistory(
      rates ? "duplicateStructureAndData" : "duplicateStructure"
    );

    JobManager.post("price-list.created", {
      userId: this.userId,
      accountId: this.accountId,
      priceListId: copyId
    });

    this.copyId = copyId;
    return this;
  },
  getUIResponse() {
    return this.newPriceList;
  },
  getId() {
    return this.copyId;
  }
});
