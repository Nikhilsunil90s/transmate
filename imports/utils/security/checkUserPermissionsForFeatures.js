import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { SecurityCheck } from "./_securityCheck.js";

const debug = require("debug")("security:feature");

class CheckFeatureSecurity extends SecurityCheck {
  constructor(args, { accountId, userId }) {
    super({ accountId, userId });
    debug("feature security for %s", this.accountId);

    this.feature = "";
    this.allowed = false;
  }

  async getDoc() {
    this.account = await AllAccounts.first(
      { _id: this.accountId },
      { fields: { features: 1 } }
    );
    this.myFeatures = this.account?.features || [];
    return this;
  }

  // check function:
  can({ feature }) {
    // ie [ "price-list",  "price-analysis", "tender", "shipment","partner", "location", "reporting" ]
    this.feature = feature;
    this.allowed = this.myFeatures.includes(feature);
    debug(
      "feature check for: %s, accountId: %s, allowed: %s",
      this.feature,
      this.accountId,
      this.allowed
    );
    return this;
  }
}

export { CheckFeatureSecurity };
