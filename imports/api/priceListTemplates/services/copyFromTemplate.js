import moment from "moment";

import { PriceListTemplate } from "/imports/api/priceListTemplates/PriceListTemplate";
import { PriceList } from "/imports/api/pricelists/PriceList";

import SecurityChecks from "/imports/utils/security/_security";

const omit = require("lodash.omit");

const debug = require("debug")("pricelist:copy");

export const copyPriceListTemplate = ({
  templateId,
  accountId,
  userId,
  title
}) => ({
  templateId,
  myAccountId: accountId,
  userId,
  title,
  async getTemplate() {
    this.template = await PriceListTemplate.first({ _id: templateId });
    if (!this.template) throw new Error("Template not found");

    // remove Model fields:
    ["_id", "id", "__is_new"].forEach(field => {
      delete this.template[field];
    });
    SecurityChecks.checkIfExists(this.template);
    return this;
  },
  transform({ data }) {
    // add defaults & overrides to data
    const defaults = {
      creatorId: this.myAccountId,
      customerId: this.myAccountId,
      validFrom: moment().toDate(),
      validTo: moment()
        .add(1, "year")
        .toDate(),
      title: `${this.title ||
        (this.template.type === "spot"
          ? "Spot rates"
          : "New Price list")} ${moment().format("YYYY-MM-DD")}`
    };
    debug("got title %s title set to ", this.title, defaults.title);
    this.data = { ...this.template, ...defaults, ...data };

    // remove fields
    this.data = omit(this.data, [
      "_id",
      "description",
      "public",
      "accountSpecific"
    ]);
    return this;
  },
  async generatePriceList() {
    // insert price list doc with data
    // bypass (otherwise it hangs...)
    const rawData = await PriceList.before_create_async(this.data, {
      accountId: this.accountId,
      userId: this.userId
    });
    this.priceListId = await PriceList._collection.insert(rawData, {
      bypassCollection2: true
    });
    return this;
  },
  get() {
    return this.priceListId;
  }
});
