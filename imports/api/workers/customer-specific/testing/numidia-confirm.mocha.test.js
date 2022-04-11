/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";
import { Rate } from "/imports/api/rates/Rate.js";
import { NumidiaPriceSelect } from "../numidia-confirm-selected-rate.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Random } from "/imports/utils/functions/random.js";

const debug = require("debug")("test:numidia:confirm_rates");

const SHIPMENT_WITHOUT_NC = "Liy2zt3cqqymTKtfj";
const CARRIER_ID = "C11051";
const ACCOUNT_ID = "S65957";
const NUMIDIA_TEST_SHIPMENT_ID = "TYqP9gRd3zXjgfBfm"; // they call this their tender id
const NUMIDIA_CARRIER_ID = "V00-001718";
let defaultMongo;
describe("numidia confirm", function() {
  this.timeout(60000);
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }
    await resetDb({ resetUsers: true });
    const startShipment = await Shipment.first(SHIPMENT_WITHOUT_NC);

    // add shipment with testing id , keep stages and other links
    await Shipment._collection.rawCollection().insertOne({
      ...JSON.parse(JSON.stringify(startShipment)),
      ...{ _id: NUMIDIA_TEST_SHIPMENT_ID }
    });

    // be sure to have a rate obj set
    const rateObj = await Rate.first();
    if (!rateObj) throw Error("no rate obj in db!");
    await Rate._collection
      .rawCollection()
      .insertOne({ ...rateObj, date: "2020-10-01", _id: Random.id() });

    // add testing edi code
    await AllAccounts._collection.update(
      {
        _id: CARRIER_ID
      },
      {
        $set: {
          accounts: [
            {
              accountId: ACCOUNT_ID,
              coding: {
                ediId: NUMIDIA_CARRIER_ID
              },
              profile: {} // profile must be set, but is not used
            }
          ]
        }
      },
      { bypassCollection2: true }
    );
  });
  it.skip("recalculate cost and confirm", async function() {
    // call numidia with fixed obj:
    //      tenderId: "mEf3ayPvvSWAH6APM",
    //      amount: 100,
    //      currency: "EUR",
    //      vendor: "000011"

    const result = await new NumidiaPriceSelect({
      shipmentId: NUMIDIA_TEST_SHIPMENT_ID,
      numidiaPriceConfirmUrl:
        "https://prod-02.westeurope.logic.azure.com:443/workflows/72abe598f2d141ae97418cfb985cdc2f/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iGdDUP5AQaa9SdbSUgvIBmGKn2feGMZxtFZSwuDgo2g"
    }).send();

    debug("numidia price set result %o", result);
    expect(result).to.be.an("object");
    expect(result.resultApi).to.equal("Success");
  });
});
