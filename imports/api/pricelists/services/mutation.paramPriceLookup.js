import { JobManager } from "../../../utils/server/job-manager.js";
import { Address } from "/imports/api/addresses/Address";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

const DEFAULT_CURRENCY = "EUR";

export const paramPriceLookup = ({ accountId, userId }) => ({
  accountId,
  userId,
  params: {},
  init({ params, options }) {
    this.qParams = params;
    this.options = options;

    this.options.currency = params.currency || DEFAULT_CURRENCY;
    return this;
  },
  async getLocationData() {
    await Promise.all(
      ["from", "to"].map(async dir => {
        if (this.qParams[dir].type === "address") {
          const address = (await Address.first(this.qParams[dir].id)) || {};
          this.params[dir] = {
            addressId: this.qParams[dir].id,
            countryCode: address.countryCode,
            zipCode: address.zip
          };
        } else {
          // location code
          this.params[dir] = { locationId: this.qParams[dir].id };
        }
      })
    );
    return this;
  },
  convertToAPIParams() {
    const { mode, serviceLevel, goods, equipment } = this.qParams;
    this.params = {
      ...this.params,
      ...mode,
      ...serviceLevel,
      ...(goods && goods.amount > 0
        ? {
            goods: { quantity: { [goods.code]: goods.amount } }
          }
        : {}),
      ...(equipment && equipment.amount > 0
        ? {
            equipments: [
              {
                type: equipment.code,
                quantity: equipment.amount
              }
            ]
          }
        : {})
    };

    return this;
  },
  get() {
    JobManager.post("tools.price-lookup", {
      userId: this.userId,
      accountId: this.accountId,
      data: this.params
    });
    return callCloudFunction(
      "runPriceLookup",
      {
        params: this.params,
        options: this.options
      },
      { userId: this.userId, accountId: this.accountId }
    );
  }
});
