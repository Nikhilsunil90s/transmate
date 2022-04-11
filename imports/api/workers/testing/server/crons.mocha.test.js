/* eslint-disable func-names */
import { expect } from "chai";
import get from "lodash.get";
import moment from "moment";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";

import { handleExpiringPriceLists } from "../../services/jobFn.handleExpiringPriceLists";
import { PriceList } from "/imports/api/pricelists/PriceList";

const debug = require("debug")("job:test");

const aboutToExpire = () =>
  moment()
    .endOf("day")
    .add(4, "days")
    .toDate();
const expired = () =>
  moment()
    .endOf("day")
    .subtract(5, "day")
    .toDate();
const notYetExpired = () =>
  moment()
    .endOf("day")
    .add(10, "months")
    .toDate();

// id | notified | validTo
const PRICE_LIST_IDS = [
  ["n8pYLq3LEzZDHqYS4", false, aboutToExpire()],
  ["KYTm5EENCghCCQxpZ", false, aboutToExpire()],
  ["3ecjkjCcskEJph8W6", true, expired()],
  ["3ecjkjCcskEJph8PP", false, notYetExpired()]
];

let defaultMongo;
describe("crons", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    return resetDb({ resetUsers: true });
  });
  describe("EmailBuilder", function() {
    it("[handleExpiringPriceLists] ", async function() {
      await Promise.all(
        PRICE_LIST_IDS.map(([id, notified, updatedValidTo]) =>
          PriceList._collection.update(
            { _id: id },
            {
              $set: {
                ...(notified ? { "notifications.isExpiring": new Date() } : {}),
                deleted: false,
                validTo: updatedValidTo,
                status: "active"
              }
            }
          )
        )
      );
      const { expiring, archived } = await handleExpiringPriceLists();

      expect(expiring).to.have.lengthOf(2);
      expect(archived).to.have.lengthOf(1);

      const haveBeenNotified = await PriceList.where(
        { _id: { $in: expiring } },
        { fields: { notifications: 1 } }
      );

      haveBeenNotified.forEach(pl =>
        expect(get(pl, ["notifications", "isExpiring"])).to.be.an.instanceof(
          Date
        )
      );
    });
  });
});
