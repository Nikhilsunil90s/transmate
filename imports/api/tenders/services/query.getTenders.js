import { Tender } from "../Tender";

export const tenderOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  fields: {
    number: 1,
    title: 1,
    created: 1,
    closeDate: 1, // TODO is no longer a field...
    status: 1,
    bidders: 1,
    accountId: 1
  },

  async get({ viewKey }) {
    let query;

    switch (viewKey) {
      case "activeTenders":
        // both bidder & requestor:
        query = {
          $or: [
            { accountId: this.accountId, status: { $in: ["open", "review"] } },
            {
              "bidders.accountId": this.accountId,
              status: {
                $in: ["open", "review"]
              }

              // "bidders.userIds": this.userId
            }
          ]
        };
        break;
      case "activeByMe":
        query = {
          accountId: this.accountId,
          status: { $in: ["open", "review"] },
          "contacts.userId": this.userId
        };
        break;
      case "draftTenders":
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
        // allTenders
        query = {
          $or: [
            { accountId: this.accountId },
            {
              "bidders.accountId": this.accountId,
              status: {
                $in: ["open", "review", "closed"]
              }

              // "bidders.userIds": this.userId
            }
          ]
        };
        break;
    }

    let tenders = await Tender.where(query, { fields: this.fields });
    tenders = tenders.map(({ bidders = [], ...tender }) => {
      const tenderDoc = Tender.init(tender);
      const status = tenderDoc.isClosed() ? "closed" : tenderDoc.status;
      return {
        ...tender,
        status,
        carrierCount: bidders.length // only if show if I am owner
      };
    });

    return tenders;
  }
});
