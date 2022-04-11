/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import pick from "lodash.pick";
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { ShipmentItem } from "../../ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";
import {
  CheckItemSecurity,
  SHIPMENT_FIELDS
} from "/imports/utils/security/checkUserPermissionsForShipmentItem";

const USER_ID = "jsBor6o3uRBTFoRQY";
const ACCOUNT_ID = "S65957";

const SHIPMENT_ITEM_ID = "oaXMFZchcXeMe52Hd";
const SHIPMENT_ID = "2jG2mZFcaFzqaThYY";

const SHIPMENT_ITEM_FIELDS = [
  "shipmentId",
  "parentItemId",
  "level",
  "quantity",
  "type",
  "itemType",
  "number",
  "description",
  "commodity",
  "references",
  "material",
  "DG",
  "DGClassType",
  "temperature",
  "weight_net",
  "weight_tare",
  "weight_gross",
  "weight_unit",
  "dimensions",
  "taxable",
  "calcSettings"
];

// const printError = checks => JSON.stringify(checks);

let defaultMongo;
describe("shipmentItems", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("security", function() {
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    const shipmentId = SHIPMENT_ID;
    let shipment;
    before(async function() {
      shipment = await Shipment.first(shipmentId, { fields: SHIPMENT_FIELDS });
    });

    it("[addItemToShipment] allows adding items when in 'draft' status", async function() {
      const shipTest = {
        ...shipment,
        status: "draft"
      };
      const test = new CheckItemSecurity({ shipment: shipTest }, context);
      await test.getUserRoles();
      test.can({ action: "addItemToShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[addItemToShipment] throws error when in 'planned' status", async function() {
      const shipTest = {
        ...shipment,
        status: "planned"
      };

      // check security
      let testError;
      try {
        const test = new CheckItemSecurity({ shipment: shipTest }, context);
        await test.getUserRoles();
        test.can({ action: "addItemToShipment" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[dragItemsInShipment] allows dragging when in 'draft' status", async function() {
      const shipTest = {
        ...shipment,
        status: "draft"
      };
      const test = new CheckItemSecurity({ shipment: shipTest }, context);
      await test.getUserRoles();
      test.can({ action: "dragItemsInShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[dragItemsInShipment] throws error when in 'planned' status", async function() {
      const shipTest = {
        ...shipment,
        status: "planned"
      };

      // check security
      try {
        const test = new CheckItemSecurity({ shipment: shipTest }, context);
        await test.getUserRoles();
        test.can({ action: "dragItemsInShipment" }).throw();
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.match(/not-allowed/);
      }
    });
    it("[updateItemInShipment] allows editing items when in 'draft' status", async function() {
      const shipTest = {
        ...shipment,
        status: "draft"
      };
      const test = new CheckItemSecurity({ shipment: shipTest }, context);
      await test.getUserRoles();
      test.can({ action: "updateItemInShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[updateItemInShipment] throws error when in 'planned' status", async function() {
      const shipTest = {
        ...shipment,
        status: "planned"
      };

      // check security
      try {
        const test = new CheckItemSecurity({ shipment: shipTest }, context);
        await test.getUserRoles();
        test.can({ action: "updateItemInShipment" }).throw();
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.match(/not-allowed/);
      }
    });
    it("[addReferencesToItem] allows updating refs in all statusses", async function() {
      const shipTest = {
        ...shipment,
        status: "started"
      };
      const test = new CheckItemSecurity({ shipment: shipTest }, context);
      await test.getUserRoles();
      test.can({ action: "addReferencesToItem" });
      expect(test.check()).to.equal(true);
    });
    it("[editWeightAndDimensions] allows updating dimensions in all statusses", async function() {
      const shipTest = {
        ...shipment,
        status: "started"
      };
      const test = new CheckItemSecurity({ shipment: shipTest }, context);
      await test.getUserRoles();
      test.can({ action: "editWeightAndDimensions" });
      expect(test.check()).to.equal(true);
    });
  });
  describe("resolvers", function() {
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    const shipmentId = SHIPMENT_ID;
    const shipmentItemId = SHIPMENT_ITEM_ID;
    let shipmentItem;
    beforeEach(async function() {
      await resetCollections(["shipments", "items"]);
      await Shipment._collection.update(
        { _id: shipmentId },
        { $set: { status: "draft" } }
      );
      shipmentItem = await ShipmentItem.first(shipmentItemId);
      return null;
    });
    it("[saveShipmentItem] updates existing item", async function() {
      const NEW_DESCRIPTION = "new Description";
      const args = {
        input: {
          ...pick(shipmentItem, "id", SHIPMENT_ITEM_FIELDS),
          description: NEW_DESCRIPTION
        }
      };

      const updatedShipment = await resolvers.Mutation.saveShipmentItem(
        null,
        args,
        context
      );

      // should return id
      expect(updatedShipment).to.be.an("object");
      expect(updatedShipment.nestedItems).to.be.an("array");
      expect(updatedShipment.nestedItems).to.have.lengthOf(1);

      expect(updatedShipment.nestedItems[0].description).to.equal(
        NEW_DESCRIPTION
      );
    });
    it("[saveShipmentItem] upserts new item if no id given", async function() {
      const args = {
        input: {
          ...pick(shipmentItem, SHIPMENT_ITEM_FIELDS)
        }
      };

      const updatedShipment = await resolvers.Mutation.saveShipmentItem(
        null,
        args,
        context
      );

      expect(updatedShipment).to.be.a("object");
      expect(updatedShipment.nestedItems).to.be.an("array");
      expect(updatedShipment.nestedItems).to.have.lengthOf(2);

      expect(updatedShipment.nestedItems[1].level).to.equal(0);
    });
    it("[deleteShipmentItem] deletes shipment item", async function() {
      const args = { input: { id: shipmentItemId } };
      const updatedShipment = await resolvers.Mutation.deleteShipmentItem(
        null,
        args,
        context
      );

      expect(updatedShipment).to.be.a("object");
      expect(updatedShipment.nestedItems).to.eql([]);
    });
    it("[deleteShipmentItem] deletes parent shipment item and updates children", async function() {
      // we have 2 items parent and child
      // delete the parent
      // check if the level of the children is corrected

      // prep: add a 2nd item:
      const args = {
        input: {
          ...pick(shipmentItem, SHIPMENT_ITEM_FIELDS),
          parentItemId: shipmentItemId,
          level: 1
        }
      };

      const updatedShipment = await resolvers.Mutation.saveShipmentItem(
        null,
        args,
        context
      );

      expect(updatedShipment).to.be.a("object");
      expect(updatedShipment.nestedItems).to.be.an("array");
      expect(updatedShipment.nestedItems).to.have.lengthOf(2);

      const args2 = { input: { id: shipmentItemId } };
      const updatedShipment2 = await resolvers.Mutation.deleteShipmentItem(
        null,
        args2,
        context
      );

      expect(updatedShipment2).to.be.a("object");
      expect(updatedShipment2.nestedItems).to.be.an("array");
      expect(updatedShipment2.nestedItems).to.have.lengthOf(1);

      expect(updatedShipment2.nestedItems[0].parentItemId).to.equal(undefined);
      expect(updatedShipment2.nestedItems[0].level).to.equal(0);
    });
    it("[changeShipmentItemParentNode]", async function() {
      // prep: add a 2nd item:
      const args = {
        input: {
          ...pick(shipmentItem, SHIPMENT_ITEM_FIELDS)
        }
      };

      const updatedShipment = await resolvers.Mutation.saveShipmentItem(
        null,
        args,
        context
      );
      expect(updatedShipment).to.be.a("object");
      expect(updatedShipment.nestedItems).to.be.an("array");
      expect(updatedShipment.nestedItems).to.have.lengthOf(2);

      const newItemId = updatedShipment.nestedItems[1].id;
      expect(newItemId).to.not.equal(undefined);

      // now move the item underneath the parent node
      const args2 = {
        input: { shipmentId, id: newItemId, targetParentItemId: shipmentItemId }
      };
      const shipmentResponse = await resolvers.Mutation.changeShipmentItemParentNode(
        null,
        args2,
        context
      );

      expect(shipmentResponse).to.not.equal(undefined);

      // test return value:
      const itemInResult = (shipmentResponse.nestedItems || []).find(
        ({ id }) => id === newItemId
      );
      expect(itemInResult.level).to.equal(1);
      expect(itemInResult.parentItemId).to.equal(shipmentItemId);

      // test db entry to be sure:
      const movedItem = await ShipmentItem.first(newItemId);
      expect(movedItem.level).to.equal(1);
      expect(movedItem.parentItemId).to.equal(shipmentItemId);
    });
    it("[splitShipmentItem] splits shipmentitem", async function() {
      const ORIGINAL_AMOUNT = 33;
      const NEW_AMOUNT = 3;
      const args = { input: { shipmentItemId, amount: NEW_AMOUNT } };
      const res = await resolvers.Mutation.splitShipmentItem(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.nestedItems).to.be.an("array");
      expect(res.nestedItems[0].quantity?.amount).to.equal(3);
      expect(res.nestedItems[1].quantity?.amount).to.equal(30);

      // check updates in weight:
      expect(res.nestedItems[0].weight_net).to.equal(
        shipmentItem.weight_net * (NEW_AMOUNT / ORIGINAL_AMOUNT)
      );
      expect(res.nestedItems[1].weight_net).to.equal(
        shipmentItem.weight_net *
          ((ORIGINAL_AMOUNT - NEW_AMOUNT) / ORIGINAL_AMOUNT)
      );

      // same holds for the taxable items...
    });
  });
});
