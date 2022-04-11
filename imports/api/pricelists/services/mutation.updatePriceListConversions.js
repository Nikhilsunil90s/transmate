import { PriceList } from "/imports/api/pricelists/PriceList";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList";
import { pipelineBuilder } from "./_pipelineBuilder";

export const updatePriceListConversions = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(
      { _id: priceListId },
      {
        fields: {
          status: 1,
          creatorId: 1,
          customerId: 1,
          carrierId: 1,
          uoms: 1,
          volumes: 1
        }
      }
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
    check.can({ action: "canModifyConversions" }).throw();

    return this;
  },

  async updateConversions({ conversions = [] }) {
    await this.priceList.update_async({
      uoms: {
        allowed: [
          ...new Set([
            ...this.priceList.volumes?.map(({ uom }) => uom),
            ...conversions.map(({ from: { uom } }) => uom)
          ])
        ],
        conversions: [...conversions]
      }
    });
    return this;
  },
  getUIresponse() {
    return pipelineBuilder({ accountId, userId })
      .match({ priceListId: this.priceListId })
      .project({}, true)
      .fetch();
  }
});
