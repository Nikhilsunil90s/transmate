import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList";
import { PriceList } from "/imports/api/pricelists/PriceList";

export const updateAttachment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceList = await PriceList.first(
      { _id: priceListId },
      { fields: { attachments: 1, creatorId: 1 } }
    );

    return this;
  },
  async runChecks() {
    SecurityChecks.checkIfExists(this.priceList);
    const check = new CheckPriceListSecurity(
      {
        priceList: this.priceList
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "deleteAttachment" }).throw();
    return this;
  },
  async remove({ index }) {
    if (!(index > -1)) throw new Meteor.Error("no valid index");

    const attachments = this.priceList.attachments || [];
    attachments.splice(index);

    await this.priceList.update_async({ attachments });
    return attachments;
  },
  async add({ attachment }) {
    await this.priceList.push({
      attachments: {
        ...attachment,
        added: {
          by: this.userId,
          at: new Date()
        },
        accountId: this.accountId
      }
    });

    const priceList = await this.priceList.reload();
    return priceList.attachments;
  }
});
