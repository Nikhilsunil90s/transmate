import pick from "lodash.pick";

import { AllAccounts } from "../../allAccounts/AllAccounts";
import { PartnerShipService } from "../../partnerships/services/service";
import { oPath } from "../../../utils/functions/path";

// import schema from "../../.jsonSchemas/restAPI/imports-partners.json";

const debug = require("debug")("imports:partners");

class DataImportPartners {
  constructor({ accountId, userId, importId }) {
    this.accountId = accountId;
    this.userId = userId;
    this.importId = importId;
    this.warnings = [];
    return this;
  }

  initData({ data }) {
    this.data = data;
    debug("data initialized");
    return this;
  }

  // validate() {
  //   const ajv = new Ajv({ allErrors: true });
  //   const valid = ajv.validate(schema, this.data);
  //   if (!valid) throw new Meteor.Error(ajv.errors);
  //   debug("data validated");
  //   return this;
  // }

  transform() {
    return this;
  }

  async upsertPartner() {
    // partner exists? -> fuzzy search with name?
    this.partnerAccount = await AllAccounts.first(
      {
        $text: { $search: this.data.name }
      },
      {
        fields: {
          name: 1,
          role: 1,
          [`account.${this.accountId}`]: 1,
          partners: { $elemMatch: { accountId: this.accountId } }
        }
      }
    );
    if (!this.partnerAccount) {
      this.partnerAccount = await AllAccounts.create_async({
        type: this.data.type,
        name: this.data.name,
        ...(this.data.role ? { role: this.data.role } : undefined)
      });
      debug("account created with _id %s", this.partnerAccount._id);
    }

    return this;
  }

  async setUpPartnership() {
    if (!oPath(["partnerAccount", "partners", 0, "accountId"], this)) {
      const srv = new PartnerShipService({
        requestorId: this.accountId,
        requestedId: this.partnerAccount._id
      });
      await srv.init();
      await srv.create({ importId: this.importId });
      srv.get();
      debug("partnerShip (re)initialized");
    }
    return this;
  }

  async updates() {
    // update notes, contacts, etc
    const root = `account.${this.accountId}`;
    const updates = {};
    if (this.data.id) updates[`${root}.id`] = this.data.id;
    if (this.data.notes) updates[`${root}.notes`] = this.data.notes;
    if (this.data.colorCode && /^#[0-9A-F]{6}$/i.test(this.data.colorCode)) {
      updates[`${root}.colorCode`] = this.data.colorCode;
    }

    await this.partnerAccount.update_async(updates);

    // as we are running in parallel, we need to do a db push!!
    if (this.data.lastName || this.data.firstName) {
      const contact = pick(this.data, [
        "firstName",
        "lastName",
        "email",
        "phone",
        "role",
        "division"
      ]);
      await this.partnerAccount.push(
        { [`${root}.profile.contacts`]: contact },
        true
      );
    }
    return this;
  }

  get() {
    return {
      partnerId: this.partnerAccount._id,
      name: this.partnerAccount.name,
      warnings: this.warnings
    };
  }

  check() {
    this.partnerAccount.reload();
    debug("document after updates: %O", this.partnerAccount);
  }
}

export { DataImportPartners };
