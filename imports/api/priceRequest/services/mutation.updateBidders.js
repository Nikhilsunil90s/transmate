import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";

import { PriceRequest } from "../PriceRequest";
import { priceRequestService } from "./priceRequest";

/**
 * method to get "best" bidders
 * @param {String} priceRequestId
 */
export const updateBidders = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequest = await PriceRequest.first(priceRequestId);
    SecurityChecks.checkIfExists(this.priceRequest);

    const check = new CheckPriceRequestSecurity(
      {
        request: this.priceRequest
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );

    await check.getUserRoles();

    check.can({ action: "addPartners" }).throw();
    return this;
  },
  async update({ partnerIds }) {
    const srv = priceRequestService({
      userId: this.userId,
      accountId: this.accountId
    });
    await srv.init({ priceRequest: this.priceRequest });
    const { errors, warnings, success } = await srv.addRemoveBidders({
      partnerIds
    }); // async

    this.res = { errors, warnings, success };
    return this;
  },
  async getUIResponse() {
    const priceRequest = await this.priceRequest.reload();

    return {
      priceRequest,
      errors: this.res.errors,
      warnings: this.res.warnings,
      accountsAdded: get(this.res, ["success", "accountsAdded"], 0),
      accountsRemoved: get(this.res, ["success", "accountsRemoved"], 0)
    };
  }
});
