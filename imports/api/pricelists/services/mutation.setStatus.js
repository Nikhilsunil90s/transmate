import { JobManager } from "../../../utils/server/job-manager.js";
import { PriceList } from "../PriceList";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { EdiJobs } from "/imports/api/jobs/Jobs";

import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList";
import newJob from "../../jobs/newJob";

const debug = require("debug")("pricelist:method");

const minimalFields = {
  creatorId: 1,
  clientId: 1,
  customerId: 1,
  carrierId: 1,
  status: 1,
  priceRequestId: 1,
  type: 1
};

export const setPriceListStatus = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(priceListId, {
      fields: minimalFields
    });
    SecurityChecks.checkIfExists(this.priceList);
    this.security = new CheckPriceListSecurity(
      {
        priceList: this.priceList
      },
      { accountId: this.accountId, userId: this.userId }
    );
    const role = this.security.getRole();
    this.role = role;
    return this;
  },
  async release() {
    // is status stays the same it is an update
    const statusChange = this.priceList.status !== "for-approval";

    // If this price list is a request give it the for-aproval status and sent
    // the customer an e-mail to notify of the status change
    await this.priceList.setStatus("for-approval");
    await this.priceList.updateHistory("releaseForApproval");
    const { priceRequestId } = this.priceList;
    if (priceRequestId) {
      // flow for price request bids
      debug("set bid to true on price request", priceRequestId);
      const updateResult = await PriceRequest._collection.update(
        {
          _id: priceRequestId,
          "bidders.priceListId": this.priceListId
        },
        { $set: { "bidders.$.bid": true } }
      );
      debug("result release %o", updateResult);
      JobManager.post("price-request.bidReceived", {
        priceRequestId,
        priceList: this.priceList, // for account and carrier info
        userId: this.userId, // user who has released the pricelist,
        statusChange
      });

      // wait some sec to be sure all data is set
      debug("make sure to recalculate, set notification", priceRequestId);
      newJob(EdiJobs, "process.priceRequest.recalculate", {
        priceRequestId
      })
        .delay(3 * 1000)
        .timeout(60 * 1000)
        .save();
    } else {
      // let user know that he has a new pricelist
      JobManager.post("price-list.released", this.priceList);
    }
  },
  async approve() {
    await this.priceList.setStatus("active");
    await this.priceList.updateHistory("approve");
    JobManager.post("price-list.approved", this.priceList);
  },
  async decline() {
    await this.priceList.setStatus("declined");
    await this.priceList.updateHistory("decline");
    JobManager.post("price-list.declined", this.priceList);
  },
  async activate() {
    await this.priceList.setStatus("active");
    await this.priceList.updateHistory("activate");
  },
  async deactivate() {
    await this.priceList.setStatus("inactive");
    await this.priceList.updateHistory("deactivate");
  },
  async toDraft() {
    if (this.role.isOwner) {
      await this.priceList.setStatus("draft");
      await this.priceList.updateHistory("draft");
    } else if (this.role.isBidder && this.priceList.type !== "global") {
      // I am a carrier and I was offering my priceList -> put back in requested mode
      // I need to make some changes
      await this.priceList.setStatus("requested");
      await this.priceList.updateHistory("requested");

      JobManager.post("price-list.request-cancelled", this.priceList);
    } else {
      throw new Meteor.Error(
        "status error",
        "Could not set your status to draft"
      );
    }
  },
  async archive() {
    await this.priceList.setStatus("archived");
    await this.priceList.updateHistory("archive");
  },
  async setStatus({ action }) {
    switch (action) {
      case "release": {
        this.security.can({ action: "canBeReleased" }).throw();
        await this.release();
        break;
      }
      case "approve": {
        this.security.can({ action: "canBeApproved" }).throw();
        await this.approve();
        break;
      }
      case "decline": {
        this.security.can({ action: "canBeDeclined" }).throw();
        await this.decline();
        break;
      }
      case "deactivate": {
        this.security.can({ action: "canBeDeactivated" }).throw();
        await this.deactivate();
        break;
      }
      case "draft": {
        this.security.can({ action: "canBeSetBackToDraft" }).throw();
        await this.toDraft();
        break;
      }
      case "activate": {
        this.security.can({ action: "canBeActivated" }).throw();
        await this.activate();
        break;
      }
      case "archive": {
        this.security.can({ action: "canBeArchived" }).throw();
        await this.archive();
        break;
      }
      case "delete": {
        this.security.can({ action: "canBeDeleted" }).throw();
        await this.priceList.delete();
        break;
      }
      default:
        throw new Meteor.Error("Action not found");
    }
  },
  getUIresponse() {
    return PriceList.first(this.priceListId, { fields: { status: 1 } });
  }
});
