import { Tender } from "/imports/api/tenders/Tender";
import { tenderBidService } from "/imports/api/tenders/services/tenderBid";

export const bidFixedPriceList = ({ accountId, userId }) => ({
  accountId,
  userId,
  async generateBid({ tenderId }) {
    const tender = await Tender.first(
      { _id: tenderId },
      {
        fields: {
          title: 1,
          bidders: 1,
          accountId: 1,
          params: 1
        }
      }
    );

    const srv = await tenderBidService({ userId, accountId })
      .init({ tender })
      .check()
      .bidFixedPriceList({ bidderId: accountId });
    this.copiedPriceListId = srv.get("copiedPriceListId");
    this.myBid = srv.get("myBid");

    return this;
  },
  getUIResponse() {
    return {
      priceListId: this.copiedPriceListId,
      myBid: this.myBid
    };
  }
});
