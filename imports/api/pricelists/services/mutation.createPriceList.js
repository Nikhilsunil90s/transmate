import { JobManager } from "../../../utils/server/job-manager.js";

import { PriceListSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list";
import { PriceList } from "/imports/api/pricelists/PriceList";

export const createPriceList = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create({ data = {} }) {
    const plData = {
      // defaults:
      creatorId: this.accountId,
      customerId: this.accountId, // initially set it on own account
      carrierId: this.accountId, // initially set it on own account
      created: { by: this.userId, at: new Date() },

      // update:
      ...data
    };
    const priceListData = PriceListSchema.clean(plData);

    this.priceList = await PriceList.create_async(priceListData, {
      userId,
      accountId
    });

    return this;
  },
  setNotification() {
    JobManager.post("price-list.created", {
      userId: this.userId,
      accountId: this.accountId,
      priceListId: this.priceList._id
    });
    return this;
  },
  get() {
    return this.priceList;
  }
});
