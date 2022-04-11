import moment from "moment";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import get from "lodash.get";
import { JobManager } from "../../../utils/server/job-manager.js";

const debug = require("debug")("price-list:rates:update");

export const createPriceListFromFile = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create({ partnerId, xlsUrl }) {
    this.pricelist = await PriceList.create_async({
      title: `Upload pricelist - ${moment().format(
        "YYYY-MM-DD"
      )} - ${partnerId}`,
      customerId: this.accountId,
      creatorId: this.accountId,
      xlsUrl,
      carrierId: partnerId,
      template: { type: "road" },
      status: "draft",
      uoms: {
        allowed: ["kg"]
      }
    });
    debug("pricelist %j", this.pricelist);
    return this;
  },
  setNotification() {
    JobManager.post("price-list.created", {
      userId: this.userId,
      accountId: this.accountId,
      priceListId: this.pricelist._id
    });
    return this;
  },
  async generateData() {
    try {
      const cloudResult = await callCloudFunction(
        "excelPriceList",
        {
          priceListId: this.pricelist._id
        },
        { userId: this.userId, accountId: this.accountId }
      );
      debug("could call result %o", cloudResult);
      const cloudError = get(cloudResult, "result.error.message");
      if (cloudError) throw Error(cloudError);
      await this.pricelist.update_async({ status: "draft" });
      this.pricelist.updateHistory("uploaded");
    } catch (err) {
      await this.pricelist.update_async({
        title: `${this.pricelist.title} ERROR`
      });
      return new Meteor.Error("wrong return of api", err);
    }
    return this;
  },
  get() {
    return this.pricelist;
  }
});
