import get from "lodash.get";

import { Address } from "../Address";
import { Location } from "../../locations/Location";

const debug = require("debug")("address:search");

const addressMap = address => {
  const addr = Address.init(address);
  return {
    id: address._id,
    name: addr.name(),
    formatted: addr.format(),
    isGlobal: get(address, ["accounts", "length"]) === 0,
    timeZone: address.timeZone
  };
};

const locationMap = ({ id, name, timeZone }) => ({ id, name, timeZone });

function makePromise(thisObj = null, fn) {
  return new Promise((resolve, reject) => {
    async function run() {
      try {
        const result = await fn.call(thisObj);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    run();
  });
}

export const searchAddress = ({ accountId, userId }) => ({
  accountId,
  userId,
  book: [],
  global: [],
  locode: [],
  async search({ query: $search, options = {} }) {
    debug("searchAddress.search BEGIN SEARCH", $search, options);

    this.options = options;
    const promises = [];
    if ($search || $search.length > 3) {
      const promise = makePromise(this, () =>
        Address.where(
          {
            $text: { $search }, // searches [aliases in db]
            "accounts.id": this.accountId
          },
          {
            limit: 5,
            score: { $meta: "textScore" },
            ...Address.projectFields(this.accountId) // accounts: [{id: myAccountId}] as only element
          }
        )
      ).then(results => {
        this.book = results.map(addressMap);
        debug("book results", this.book);
        return this;
      });
      promises.push(promise);
    }

    if (!this.options.excludeGlobal) {
      const promise = makePromise(this, () =>
        Address.where(
          {
            $text: { $search }, // searches [aliases in db]
            "accounts.id": { $ne: this.accountId }
          },
          {
            limit: 5,
            ...Address.projectFields(this.accountId) // accounts: [{id: myAccountId}] as only element
          }
        )
      ).then(results => {
        this.global = results.map(addressMap);
        debug("global results", this.global);
        return this;
      });

      promises.push(promise);
    }

    // TODO [#236]: is this still needed? index is now the full locode
    // if (search.length === 5) {
    //   // eslint-disable-next-line no-param-reassign
    //   search = `${search.substring(0, 2)} ${search.substring(2)} ${search}`;
    // }
    // debug("location port earch for %s", search);

    if (!this.options.excludeLocodes) {
      const promise = makePromise(this, () =>
        Location.where(
          {
            $text: { $search },
            movements: { $gt: 0 }
          },
          {
            limit: 5,
            fields: {
              name: 1,
              locationCode: 1,
              countryCode: 1,

              // These fields are needed for creating a shipment
              timeZone: 1,
              function: 1,
              latLng: 1
            }
          }
        )
      ).then(results => {
        this.locode = results.map(locationMap);
        debug("locode results", this.locode);
        return this;
      });
      promises.push(promise);
    }
    try {
      await Promise.all(promises);
    } catch (e) {
      debug("address search ERROR:", e);
    }
    debug("address search FINAL RESULTS:", $search, this.getResults());

    return this;
  },
  getResults() {
    return {
      book: this.book,
      global: this.global,
      locode: this.locode
    };
  }
});
