/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { Shipment } from "/imports/api/shipments/Shipment";

import { generatePickingItems } from "../generatePickingItems";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";

const debug = require("debug")("shipmentpicking:label:test");

const USER_ID = "jsBor6o3uRBTFoRQY";
const ACCOUNT_ID = "S65957";
const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(16, 0, 0, 0);

const testAddress = {
  AT: {
    isValidated: true,
    name: "Jan Transmate",
    phoneNumber: "+3247852258",
    countryCode: "AT",
    latLng: {
      lat: 48.20859,
      lng: 16.36721
    },
    addressId: "3EYmBGFB3DR8Eb87e",
    zipCode: "1010",
    address: {
      street: "Kohlmarkt",
      number: "14",
      city: "Wien"
    },
    timeZone: "Europe/Vienna"
  },
  FR: {
    isValidated: true,
    name: "Philip Transmate",
    countryCode: "FR",
    latLng: {
      lat: 48.88709,
      lng: 2.34343
    },
    addressId: "3Stkc6Yo3R45ZJGBG",
    zipCode: "75018",
    address: {
      street: "35 Rue du Chevalier de la Barre",
      address1: "Batiment 1",
      address2: null,
      number: null,
      city: "Paris"
    },
    timeZone: "Europe/Paris"
  },
  US: {
    isValidated: true,
    name: "Marc Transmate",
    countryCode: "US",
    latLng: {
      lat: 40.7559342,
      lng: -74.064512
    },
    addressId: "ZZMbv9rMn6xJTtj62",
    zipCode: "07307",
    address: {
      street: "County Rd 658",
      number: "166-198",
      city: "jersey City"
    },
    timeZone: "America/New_York"
  }
};

// const printError = checks => JSON.stringify(checks);
const context = {
  accountId: ACCOUNT_ID,
  userId: USER_ID
};
let defaultMongo;
if (process.env.AWS_SECRET_ACCESS_KEY) {
  // is calling the test service of DHL
  describe("shipmentPickingLabels", function() {
    let packingItemIds = [];
    before(async () => {
      if (process.env.DEFAULT_MONGO) {
        debug("resetdb");
        // eslint-disable-next-line global-require
        defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
        await defaultMongo.connect();
      }

      const resetDone = await resetDb({ resetUsers: true });
      if (!resetDone) throw Error("reset was not possible, test can not run!");
      Meteor.setUserId && Meteor.setUserId(USER_ID);
    });

    before(function() {
      // check if the necessary environment variables are here:
      [
        "AWS_DEFAULT_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_S3_BUCKET",
        "IBM_FUNCTION_URL",
        "IBM_FUNCTION_KEY",
        "DEBUG_DHL"
      ].forEach(envKey => {
        expect(process.env[envKey]).to.not.equal(
          undefined,
          `${envKey} should be set for the test`
        );
      });

      // to make use it is not the mocked one:
      expect(process.env.AWS_S3_BUCKET).to.not.equal("testBucket");
    });

    beforeEach(async function() {
      await resetCollections(["items", "shipments"]);
      debug("set from location to AT! needed for dhl!");
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "pickup.datePlanned": tomorrow,
            "pickup.location": testAddress.AT
          }
        }
      );
      packingItemIds = await generatePickingItems({
        shipmentId: SHIPMENT_ID,
        count: 3,
        overrides: {
          isPicked: false,
          isPackingUnit: true,
          weight_gross: 2,
          weight_unit: "kg",
          dimensions: { width: 21, height: 22, length: 23, uom: "cm" }
        }
      });

      // add some sub-items to a packingUnit (for customs value):
      await generatePickingItems({
        shipmentId: SHIPMENT_ID,
        count: 3,
        overrides: {
          isPicked: true,
          isPackingUnit: false,
          description: "Milk",
          parentItemId: packingItemIds[0],
          weight_net: 2,
          weight_gross: 3,
          weight_unit: "kg",
          dimensions: { width: 21, height: 22, length: 23, uom: "cm" },
          customs: {
            HScode: "1006.30",
            value: 100,
            currency: "USD",
            countryOfOrigin: "DE"
          }
        },
        keepOtherItems: true
      });
      return true;
    });

    it("[getShipmentLabelOptions] returns the options from the api AT-AT", async function() {
      debug("run label options with packing item %o", packingItemIds);
      const args = { packingItemIds };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.AT
          }
        }
      );
      const res = await resolvers.Query.getShipmentLabelOptions(
        null,
        args,
        context
      );

      expect(res).to.be.an("array");

      // debug("test result rates %j", res);
      expect(res[0].serviceType).to.be.an("string");
      debug(
        "service options AT-AT %o",
        res.map(({ serviceType }) => serviceType)
      );
      debug("rate %o", res[0]);
      expect(res[0].amount).to.be.an("number");
    });

    it("[getShipmentLabelOptions]returns the options from the api AT-FR", async function() {
      debug("run label options with packing item %o", packingItemIds);
      const args = { packingItemIds };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.FR
          }
        }
      );
      const res = await resolvers.Query.getShipmentLabelOptions(
        null,
        args,
        context
      );

      expect(res).to.be.an("array");
      debug("test result rates %j", res);

      expect(res[0].serviceType).to.be.an("string");
      expect(res[0].amount).to.be.an("number");
      expect(res[0].currency).to.be.an("string");
      debug(
        "service options AT-FR %o",
        res.map(({ serviceType }) => serviceType)
      );
    });
    it("[getShipmentLabelOptions]returns the options from the api AT-US", async function() {
      debug("run label options with packing item %o", packingItemIds);
      const args = { packingItemIds };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.US
          }
        }
      );
      const res = await resolvers.Query.getShipmentLabelOptions(
        null,
        args,
        context
      );

      expect(res).to.be.an("array");
      debug("test result rates %j", res);
      expect(res[0].serviceType).to.be.an("string");
      expect(res[0].amount).to.be.an("number");
      expect(res[0].currency).to.be.an("string");
    });

    it("[confirmShipmentLabelOption]confirms the chosen option N (domestic) from the api AT-AT", async function() {
      // domestic options [ 'C', 'I', 'O', '1', 'N', '7' ]
      // currently not working on test account!
      const args = {
        input: { packingItemIds, rateOptionId: "N", rate: {} }
      };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "costParams.entity": "ENT2", // testing registration number
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.AT
          }
        }
      );
      debug("shipment time is %o", tomorrow);
      await resolvers.Mutation.confirmShipmentLabelOption(null, args, context);
      debug("check shipment info for %o", packingItemIds);
      const info = await ShipmentItem.first(packingItemIds[0], {
        fields: { edi: 1, "pickup.datePlanned": 1 }
      });
      debug("Mutation.confirmShipmentLabelOption %o", info.edi);
      expect(info.edi.label).to.be.an("object");
      expect(info.edi.label.id).to.be.an("string");

      // check manually:
      console.log("[AT-AT]", info.edi.label.labelUrl);
    });
    it("[confirmShipmentLabelOption]confirms the chosen option U from the api AT-FR", async function() {
      const args = {
        input: { packingItemIds, rateOptionId: "U", rate: {} }
      };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "costParams.entity": "ENT2", // testing registration number
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.FR
          }
        }
      );
      debug("shipment time is %o", tomorrow);
      const res = await resolvers.Mutation.confirmShipmentLabelOption(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined, "returns response");
      expect(res.shipment).to.not.equal(
        undefined,
        "shipment is returned for apollo cache"
      );
      expect(res.labelUrl).to.not.equal(undefined, "labelUrl is return");

      debug("check shipment info for %o", packingItemIds);
      const info = await ShipmentItem.first(packingItemIds[0], {
        fields: { edi: 1, "pickup.datePlanned": 1 }
      });
      debug("Mutation.confirmShipmentLabelOption %o", info.edi);
      expect(info.edi.label).to.be.an("object");
      expect(info.edi.label.id).to.be.an("string");

      // check manually:
      console.log("[AT-FR]", info.edi.label.labelUrl);
    });
    it("[confirmShipmentLabelOption]confirms the chosen option P from the api AT-US", async function() {
      const args = {
        input: { packingItemIds, rateOptionId: "P", rate: {} }
      };
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            "costParams.entity": "ENT2", // testing registration number
            "pickup.datePlanned": tomorrow,
            "delivery.location": testAddress.US
          }
        }
      );
      debug("shipment time is %o", tomorrow);
      const res = await resolvers.Mutation.confirmShipmentLabelOption(
        null,
        args,
        context
      );
      debug("check shipment info for %o ,res %o", packingItemIds, res);

      expect(res.labelUrl).to.not.equal(
        undefined,
        "url is passed in the root of the return value"
      );

      const shipmentItem = await ShipmentItem.first(packingItemIds[0], {
        fields: { edi: 1, "pickup.datePlanned": 1 }
      });
      debug("Mutation.confirmShipmentLabelOption %o", shipmentItem.edi);
      expect(shipmentItem.edi.label).to.be.an(
        "object",
        "we should have a label object"
      );
      expect(shipmentItem.edi.label.id).to.be.an("string");

      // check manually:
      console.log("[AT-US]", shipmentItem.edi.label.labelUrl);
    });

    it("[confirmShipmentLabelOption]confirms the chosen option before 12 from the api", async function() {
      const args = {
        input: { packingItemIds, rateOptionId: "P", rate: {} }
      };
      let result;
      try {
        result = await resolvers.Mutation.confirmShipmentLabelOption(
          null,
          args,
          context
        );
      } catch (e) {
        result = e;
      }
      expect(result, `we expected an error ${JSON.stringify(result)}`).to.be.an(
        "error"
      );
      expect(result.message).to.contain(
        "Requested product(s) not available at payer"
      );
    });
  });
}
