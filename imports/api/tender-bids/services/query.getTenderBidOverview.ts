import { TenderBidType } from "../interfaces/tenderBid";
import { TenderBid } from "../TenderBid";

interface TenderBidOverview {
  accountId: string;
  userId: string;
  get: (
    this: TenderBidOverview,
    a: { viewKey: string }
  ) => Promise<TenderBidType>;
}

const FIELDS = {
  number: 1,
  name: 1,
  created: 1,
  status: 1,
  accountId: 1,
  tender: 1,
  "partner.name": 1
};

export const tenderBidOverview: (a: {
  accountId: string;
  userId: string;
}) => TenderBidOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ viewKey }) {
    let query;

    switch (viewKey) {
      case "activeBids":
        query = {
          accountId: this.accountId,
          status: { $in: ["open", "review"] }
        };
        break;
      case "activeByMe":
        query = {
          accountId: this.accountId,
          status: { $in: ["open", "review"] },
          "contacts.userId": this.userId
        };
        break;
      case "draftBids":
        query = {
          accountId: this.accountId,
          status: { $in: ["draft"] }
        };
        break;
      case "allByMe":
        query = {
          accountId: this.accountId,
          "contacts.userId": this.userId
        };
        break;
      default:
        // allBids
        query = {
          accountId: this.accountId
        };
        break;
    }

    const tenderBids = await TenderBid.where(query, {
      fields: FIELDS,
      sort: { "created.at": -1 }
    });
    return tenderBids;
  }
});
