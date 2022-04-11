/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import moment from "moment";

// data
import { expect } from "chai";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { Import } from "/imports/api/imports/Import-shipments";
import { importDoc } from "../importData";
import { ediRowData } from "../importRowData";

import { ImportProcesser } from "/imports/api/imports/services/shipmentImportProcesser";

const ACCOUNT_ID = "S56205";

let defaultMongo;
describe("shipment-import-worker", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("worker - build shipment", function() {
    beforeEach(function() {
      return Promise.all([
        Import._collection.insert(importDoc),
        EdiRows.rawCollection().insert(ediRowData)
      ]);
    });
    it("processes the data after mapping", async function() {
      const srv = new ImportProcesser({ accountId: ACCOUNT_ID });

      await srv.init({
        importId: importDoc._id,
        number: ediRowData[0].data.shipment
      });
      expect(srv.hasRows()).to.equal(true);
      const { shipment, errors } = srv.prepareShipmentData().get();

      // !! circle ci is in different timezone -> therefore we need to
      const expectedOutcome = {
        serviceLevel: "FTL",
        references: { number: "3012132131" },
        shipperId: "S56205",
        consigneeId: "S56205",
        edi: {
          account: {
            S56205: {
              importId: "NEY5X4iRHASAJyHEh"
            }
          }
        },
        stages: [
          {
            mode: "Road",
            from: { address: { country: "BE", zipCode: "9000" } },
            to: { address: { country: "FR", zipCode: "10199" } },
            dates: {
              pickup: {
                arrival: {
                  planned: moment(
                    ediRowData[0].data.departure_date,
                    "YYYY-MM-DD"
                  )
                    .seconds(0)
                    .milliseconds(0)
                    .toISOString()
                }
              },
              delivery: {
                arrival: {
                  planned: moment(ediRowData[0].data.arrival_date, "YYYY-MM-DD")
                    .seconds(0)
                    .milliseconds(0)
                    .toISOString()
                }
              }
            }
          }
        ],
        items: [
          {
            volume: { kg: 10000, lm: 10, pal: 2 },
            quantity_unit: "pcs",
            quantity: 1
          }
        ]
      };

      expect(shipment).to.eql(expectedOutcome);
      expect(errors).to.have.lengthOf(0);
    });
  });
});
