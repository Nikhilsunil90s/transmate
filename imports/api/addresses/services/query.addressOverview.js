import { Address } from "../Address";

const debug = require("debug")("address:methods:services");

export const addressOverview = ({ accountId, userId }) => ({
  accountId,
  userId,

  options: {},
  fields: {
    accounts: 1,
    name: 1,
    zip: 1,
    city: 1,
    street: 1,
    number: 1,
    bus: 1,
    countryCode: 1,
    country: 1,
    timeZone: 1
  },
  buildQuery({ viewKey, nameFilter }) {
    let query;

    debug("address overview for %o", { viewKey, nameFilter });
    switch (viewKey) {
      case "annotated":
        // to come
        break;
      case "search":
        query = { "accounts.id": this.accountId };
        this.options = { limit: 5 };
        break;
      default:
        query = { "accounts.id": this.accountId };
        break;
    }
    if (nameFilter && nameFilter !== "") {
      query.$or = [
        {
          "accounts.name": {
            $regex: new RegExp(nameFilter),
            $options: "i"
          }
        }
      ];
      query.$or.push({
        city: {
          $regex: new RegExp(nameFilter),
          $options: "i"
        }
      });
      query.$or.push({
        street: {
          $regex: new RegExp(nameFilter),
          $options: "i"
        }
      });
      query.$or.push({
        "accounts.coding.ediId": {
          $regex: new RegExp(nameFilter),
          $options: "i"
        }
      });
    }
    this.query = query;
    return this;
  },

  async get() {
    debug("query", this.query);

    let list = await Address.where(this.query, {
      ...(this.options || {}),
      fields: {
        ...this.fields,
        accounts: {
          $elemMatch: {
            id: this.accountId
          }
        }
      }
    });

    list = (list || []).map(doc => {
      const address = Address.init(doc);

      return {
        ...doc,
        addressName: address.name(),
        addressLine: address.line(1),
        addressFormated: address.format(),
        location: doc.location,
        countryCode: (doc.countryCode || "").toLowerCase()
      };
    });

    debug("address overview count: %o", list.length);
    return list;
  }
});
