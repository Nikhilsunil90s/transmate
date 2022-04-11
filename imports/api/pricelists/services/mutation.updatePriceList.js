import { PriceListSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list";
import { schemaClean } from "/imports/utils/functions/schemaClean";
import { PriceListService } from "./priceLists";
import { PriceList } from "/imports/api/pricelists/PriceList";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList";
import dot from "dot-object";
import { pipelineBuilder } from "./_pipelineBuilder";

const debug = require("debug")("price-list:mutation");

// function projectUpdatedFields(obj = {}) {
//   const proj = { updates: 1, status: 1 };
//   Object.keys(obj).forEach(k => {
//     proj[k] = 1;
//   });
//   return proj;
// }

export const updatePriceList = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId, updates }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(
      { _id: priceListId },
      {
        fields: {
          status: 1,
          creatorId: 1,
          customerId: 1,
          carrierId: 1,
          uoms: 1
        }
      }
    );

    const { cleanUpdate } = schemaClean({
      schema: PriceListSchema,
      updates,
      options: {
        modifier: true,
        throw: true
      }
    });

    // if (cleanUpdate.validFrom instanceof Date)
    //   cleanUpdate.validFrom = cleanUpdate.validFrom.getTime();
    // if (cleanUpdate.validTo instanceof Date)
    //   cleanUpdate.validTo = cleanUpdate.validTo.getTime();
    debug(cleanUpdate, "=result from : ", updates);
    this.updates = cleanUpdate;
    return this;
  },
  async runChecks() {
    SecurityChecks.checkIfExists(this.priceList);

    // check if keys are related to leadtime and only those
    // then we can check security on leadtimes= canModifyLeadTime
    const checkObj = JSON.parse(JSON.stringify(this.updates));
    dot.object(checkObj);
    debug("checkObj %o", checkObj);

    const check = new CheckPriceListSecurity(
      { priceList: this.priceList },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    if (
      checkObj.carrierId &&
      (checkObj.defaultLeadTime || checkObj.leadTimes)
    ) {
      check.can({ action: "canModifyLeadTime" }).throw();
    } else {
      check.can({ action: "updatePriceList" }).throw();
    }

    return this;
  },
  async update() {
    await PriceListService.updatePriceList({
      updates: this.updates,
      priceList: this.priceList
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
