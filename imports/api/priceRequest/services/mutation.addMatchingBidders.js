import get from "lodash.get";
import { getSortedCarrierList } from "@transmate-eu/bigquery_module_transmate";

import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";

import { PriceRequest } from "../PriceRequest";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { priceRequestService } from "./priceRequest";
import { PartnerSearch } from "/imports/api/partnerships/services/partnerSearch.js";

const debug = require("debug")("price-request:resolvers");

/**
 * method to get "best" bidders
 * @param {String} priceRequestId
 */
export const addMatchingBidders = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequest = await PriceRequest.first(priceRequestId);
    debug("pr %o", this.priceRequest);
    SecurityChecks.checkIfExists(this.priceRequest);

    const check = new CheckPriceRequestSecurity(
      { request: this.priceRequest },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();

    // debug("check addMatchingBidders getUserRoles %o", check);
    check.can({ action: "addPartners" }).throw();
    return this;
  },
  async findMatchingBidders() {
    const fromCC = [];
    const toCC = [];
    debug(
      "findMatchingBidders for priceRequest.items %o",
      this.priceRequest.items
    );

    // add from to if there is data
    this.priceRequest.items.forEach(item => {
      if (
        get(item, "params.from.countryCode") &&
        get(item, "params.to.countryCode")
      ) {
        fromCC.push(get(item, "params.from.countryCode"));
        toCC.push(get(item, "params.to.countryCode"));
      }
    });

    // check if params has run already. is a cloud function so this will only work on test db
    if (fromCC.length === 0 || toCC.length === 0) {
      throw new Error("No From/To country codes found in shipments!");
    }
    debug("call bg for carriers", {
      customerId: this.accountId,
      fromCC,
      toCC
    });

    const pipeline = new PartnerSearch()
      .setAccount(this.accountId)
      .find({
        filter: {}
      })
      .project()
      .get();
    const partners = await AllAccounts._collection.aggregate(pipeline);
    debug("active partners %o", partners);

    const selectedPartners = (this.priceRequest.bidders || []).map(
      bidder => bidder.accountId
    );
    debug("selected partners %o", selectedPartners);
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw Error("missing GOOGLE_CREDENTIALS, no BQ suggestions possible");
    }
    const suggestedCarriers = await getSortedCarrierList({
      customerId: this.accountId,
      fromCC,
      toCC
    });

    debug("carrierIds for adding to partners %o", suggestedCarriers);

    // keep active and not yet selected patners to invite those
    const bestPartners = partners
      .filter(el =>
        suggestedCarriers.map(carrier => carrier.carrierId).includes(el._id)
      )
      .map(el => el._id);
    debug("best active partners to add %o", bestPartners);

    // add both to addremoveBidders (it will make the list unique)
    const srv = priceRequestService({ accountId: this.accountId });
    await srv.init({ priceRequest: this.priceRequest });
    await srv.addRemoveBidders({
      partnerIds: selectedPartners.concat(bestPartners)
    });

    this.response = { suggestedCarriers, bestPartners, selectedPartners };
    debug("response %o", this.response);
    return this;
  },
  async getUIResponse() {
    const priceRequest = await this.priceRequest.reload();
    return {
      priceRequest,
      ...this.response
    };
  }
});
