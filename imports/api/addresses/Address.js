import { Mongo } from "meteor/mongo";
import get from "lodash.get";
import countries from "i18n-iso-countries";
import { AddressSchema } from "../_jsonSchemas/simple-schemas/collections/address";
import { ShortCodeSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shortCodes";
import { oPath } from "/imports/utils/functions/path";
import { pick } from "/imports/utils/functions/fnObjectPick";
import Model from "../Model";
import { addressSrv } from "./services/addressSrv";

// register all locales you want (add a file e.g. fr, etc)
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const OMIT_CC_LIST = [
  "aq",
  "bq",
  "cw",
  "gg",
  "im",
  "je",
  "bl",
  "mf",
  "sx",
  "ss",
  "xk"
];

export const ShortcodeCollection = new Mongo.Collection("shortcodes");

ShortcodeCollection.attachSchema(ShortCodeSchema);

class Address extends Model {
  static init(attrInput, parent = null, is_new = false) {
    let attr = attrInput;
    if (attr.error) {
      attr = {
        _id: "",
        street: "",
        number: "",
        bus: "",
        zip: "",
        city: "",
        state: "",
        country: "",
        timeZone: "",
        countryCode: "",
        name: ""
      };
    }
    return super.init(attr, parent, is_new);
  }

  static create(obj, callback) {
    // Check if address exists in the database already
    const existing = Address.first(
      pick(obj, "countryCode", "zip", "street", "number", "bus")
    );
    if (existing) {
      // means I created a new address, but it is already in the db
      existing.push({
        accounts: {
          id: obj.accountId,
          name: obj.name,
          notes: obj.notes
        },
        aliases: obj.name,
        linkedAccounts: obj.accountId
      });

      return existing;
    }
    return super.create(obj, callback);
  }

  // eslint-disable-next-line camelcase
  static before_create(obj) {
    check(
      obj,
      Match.ObjectIncluding({
        accountId: String
      })
    );
    obj.accounts = [
      {
        id: obj.accountId,
        name: obj.name,
        notes: obj.notes
      }
    ];
    obj.aliases = [obj.name];
    obj.linkedAccounts = [obj.accountId];
    delete obj.accountId;
    return obj;
  }

  static getDistance(fromLatLng, toLatLng) {
    const rad = x => {
      return (x * Math.PI) / 180;
    };
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = rad(toLatLng.lat - fromLatLng.lat);
    const dLong = rad(toLatLng.lat - fromLatLng.lat);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(fromLatLng.lat)) *
        Math.cos(rad(toLatLng.lat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d); // returns the distance in meter
  }

  static projectFields(accountId) {
    return {
      fields: {
        ...Address.publish,
        ...{
          accounts: {
            $elemMatch: {
              id: accountId
            }
          }
        }
      }
    };
  }

  static projectFieldsAggr(accountId) {
    return {
      $project: {
        ...Address.publish,
        accounts: {
          $filter: {
            input: "$accounts",
            cond: { $eq: ["$$this.id", accountId] }
          }
        },
        linkedAccountsCount: { $size: { $ifNull: ["$accounts", []] } }
      }
    };
  }

  name() {
    // in publication we filter on the accounts array -> so 0 is always our name...
    return (
      oPath(["accounts", 0, "name"], this) ||
      oPath(["aliases", 0], this) ||
      " - "
    );
  }

  getName() {
    return (
      get(this, ["accounts", 0, "name"]) || get(this, ["aliases", 0]) || " - "
    );
  }

  myMetaData() {
    // in publication we filter on the accounts array -> so 0 is always our name...
    return this.accounts[0];
  }

  format() {
    return `${this.street} ${[this.number]}${[this.bus]}, ${this.zip} ${[
      this.city
    ]}, ${this.country}`;
  }

  line(num = 1) {
    switch (num) {
      case 1:
        return `${this.street} ${[this.number]}${[this.bus]}`;
      case 2:
        return ` ${this.zip} ${this.city}, ${this.country}`;
      default:
        return null;
    }
  }

  code() {
    return this.countryCode + (this.zip || "").substr(0, 2);
  }

  static countryCodes() {
    return Object.entries(countries.getNames("en"))
      .filter(([code]) => !OMIT_CC_LIST.includes(code.toLowerCase()))
      .map(([code, name]) => ({
        name,
        code
      }));
  }

  static countryName(countryCode) {
    return addressSrv.countryName(countryCode);
  }
}

Address._collection = new Mongo.Collection("addresses");

Address.publish = {
  _id: 1,
  street: 1,
  number: 1,
  bus: 1,
  zip: 1,
  city: 1,
  state: 1,
  country: 1,
  countryCode: 1,
  location: 1,
  claimed: 1,
  aliases: 1,
  timeZone: 1
};

Address._collection.attachSchema(AddressSchema);
Address._collection = Address.updateByAt(Address._collection);
export { Address };
