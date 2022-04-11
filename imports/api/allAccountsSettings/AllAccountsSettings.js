import { Mongo } from "meteor/mongo";
import Model from "../Model";

import { AccountSettingsSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/allAccountsSettings";

const debug = require("debug")("collection:email on account");

class AllAccountsSettings extends Model {
  // static getCustomTemplateId({ accountId, templateId }) {
  //   const settings = this.first(accountId, { fields: { emails: 1 } });
  //   debug("customer %s settings %o", accountId, settings);
  //   const customTemplateId = oPath(["emails", templateId], settings);
  //   if (!customTemplateId) {
  //     debug("no customer template found, return id!", templateId);
  //   }
  //   return customTemplateId || templateId;
  // }

  static async setCustomScript({ accountId, script }) {
    debug("call setCustomScript");
    const check = await this.first({
      _id: accountId,
      "actions.action": script.action
    });
    if (!check) {
      const defaultAction = {
        on: "",
        action: "",
        active: true,
        data: {},
        options: {
          priority: "normal", // high, normal
          retry: {
            retries: 0,
            wait: 20000 // 20 sec
          },
          delay: 0
        }
      };

      await AllAccountsSettings._collection.update(
        { _id: accountId },
        {
          $addToSet: {
            actions: { ...defaultAction, ...script }
          }
        }
      );
      return { __is_new: true };
    }
    return { __is_new: false };
  }
}

AllAccountsSettings._collection = new Mongo.Collection("accounts.settings");
AllAccountsSettings._collection.attachSchema(AccountSettingsSchema);

export { AllAccountsSettings };
