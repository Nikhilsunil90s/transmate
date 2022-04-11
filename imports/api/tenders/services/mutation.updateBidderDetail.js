import { Tender } from "/imports/api/tenders/Tender";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckTenderSecurity } from "/imports/utils/security/checkUserPermissionsForTender";
import { tenderBidService } from "/imports/api/tenders/services/tenderBid";

export const updateBidderDetail = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ tenderId }) {
    this.tenderId = tenderId;
    this.tender = await Tender.first({ _id: tenderId });
    SecurityChecks.checkIfExists(this.tender);

    const check = new CheckTenderSecurity(
      {
        tender: this.tender
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check
      .init()
      .can({ action: "editPartners" })
      .throw();
    return this;
  },
  async updateBidder({ partnerId, topic, update }) {
    let updateMod = update;
    if (updateMod.array != null) {
      // when we get an array (the method validation takes an object -> so this is a workaround)
      updateMod = updateMod.array;
    }

    const srv = tenderBidService({ accountId, userId })
      .init({ tender: this.tender, bidderAccId: partnerId })
      .check();
    await srv.updateBid({
      topic,
      accountId: partnerId,
      update: updateMod
    });
    this.bidderIdx = srv.get("bidderIndex");
    return this;
  },
  getUIResponse() {
    return this.tender.bidders[this.bidderIdx];
  }
});
