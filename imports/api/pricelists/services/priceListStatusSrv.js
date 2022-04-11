import { JobManager } from "../../../utils/server/job-manager.js";
import { PriceList } from "../PriceList";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "../../jobs/newJob";

const debug = require("debug")("pricelist:method");

export const priceListStatusUpdates = ({
  priceList = {},
  accountId,
  userId
}) => ({
  priceList,
  priceListId: priceList._id,
  accountId,
  userId,

  /** initializes model if priceList would be doc and not the model itself
   * is only required if priceList != model instance
   */
  init() {
    this.priceList = PriceList.init(this.priceList);
    return this;
  },

  /** releases the priceList (=status for-approval) and triggers notifications*/
  async release() {
    debug("release pricerequest");

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
      debug({ updateResult });
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
  }
});
