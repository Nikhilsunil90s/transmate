import { PriceList } from "../PriceList";

const debug = require("debug")("price-list:views");

export const priceListView = ({ accountId, userId }) => ({
  accountId,
  userId,
  fields: {
    _id: 1,
    carrierId: 1,
    customerId: 1,
    carrierName: 1,
    created: 1,
    summary: 1,
    validTo: 1,
    title: 1,
    type: 1,
    status: 1,
    category: 1,
    mode: 1, // all needed for (default) title
    template: 1 // template is needed so the correct tabs are rendered
  },

  get({ viewKey, filters }) {
    // put filters first to avoid overwriting defaults
    const query = {
      ...filters,

      deleted: false
    };

    switch (viewKey) {
      case "myRateCards":
        query["created.by"] = this.userId;
        query.creatorId = accountId;
        break;
      case "draftPriceLists":
        query.creatorId = accountId;
        query.status = { $in: ["draft"] };
        break;
      case "forApproval":
        query.$or = [
          {
            creatorId: accountId,
            status: {
              $in: ["requested", "for-approval"]
            }
          },
          {
            customerId: accountId,
            status: {
              $in: ["requested", "for-approval"]
            }
          },
          {
            carrierId: accountId,
            status: {
              $in: ["for-approval"]
            }
          }
        ];
        break;
      case "allPriceLists": // (no spot requests)
        query.type = { $ne: "spot" };
        query.$or = [
          {
            creatorId: accountId,
            status: {
              $in: ["draft", "requested", "for-approval", "active", "inactive"]
            }
          },
          {
            customerId: accountId,
            status: {
              $in: ["requested", "for-approval", "active", "inactive"]
            }
          },
          {
            carrierId: accountId,
            status: {
              $in: ["for-approval", "active", "inactive"]
            }
          }
        ];
        break;
      case "allPriceListsSpot":
        query.type = "spot";
        query.$or = [
          {
            creatorId: accountId,
            status: {
              $in: ["draft", "requested", "for-approval", "active", "inactive"]
            }
          },
          {
            customerId: accountId,
            status: {
              $in: ["requested", "for-approval", "active", "inactive"]
            }
          },
          {
            carrierId: accountId,
            status: {
              $in: ["for-approval", "active", "inactive"]
            }
          }
        ];
        break;
      default:
        // active price lists,
        query.$or = [
          {
            creatorId: accountId,
            status: {
              $in: ["active"]
            }
          },
          {
            customerId: accountId,
            status: {
              $in: ["active"]
            }
          },
          {
            carrierId: accountId,
            status: {
              $in: ["active"]
            }
          }
        ];

        break;
    }
    debug("use this view for pricelist %j", query);
    return PriceList.where(query, { fields: this.fields });
  }
});
