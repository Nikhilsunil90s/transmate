/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";
import faker from "faker";

import { resolvers } from "/imports/api/documents/apollo/resolvers.js";
import { resetCollections } from "../../zz_utils/services/server/loadFixtures/resetCollection";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";

let defaultMongo;
describe("shipments async", function() {
  const context = {
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  beforeEach(async () => {
    await resetCollections(["shipments", "documents"]);
  });
  it("[generateShipmentDocument] generates doc", async function() {
    process.env.MOCK_generateDoc = true;
    const args = {
      input: {
        shipmentId: SHIPMENT_ID,
        type: "deliveryNote"
      }
    };
    const shipment = await resolvers.Mutation.generateShipmentDocument(
      null,
      args,
      context
    );

    expect(shipment).be.an("object");
    expect(shipment.documents).to.be.an("array");
    expect(shipment.documents).to.have.lengthOf(2);
    expect(shipment.documents[1].type).to.equal("deliveryNote");
    expect(shipment.documents[1].id).to.not.equal(undefined);

    process.env.MOCK_generateDoc = false;
  });
  it("[addShipmentDocument]", async function() {
    const args = {
      input: {
        link: { shipmentId: SHIPMENT_ID },
        data: {
          type: "bol",
          meta: {
            type: "application/pdf",
            name: faker.system.commonFileName(),
            lastModifiedDate: new Date(),
            size: 32182
          },
          store: {
            service: "s3",
            bucket: "files.transmate.eu",
            key: "documents/shipment/LLRyGNuS6e7ZeH8AG/mwSiQ"
          }
        }
      }
    };
    const updatedShipment = await resolvers.Mutation.addShipmentDocument(
      null,
      args,
      context
    );

    expect(updatedShipment).be.an("object");
    expect(updatedShipment.documents).to.be.an("array");
    expect(updatedShipment.documents).to.have.lengthOf(2);
    expect(updatedShipment.documents[1].type).to.equal("bol");
    expect(updatedShipment.documents[1].id).to.not.equal(undefined);
  });
  it("[removeShipmentDocument]", async function() {
    const args = {
      input: {
        shipmentId: "2jG2mZFcaFzqaThcr",
        documentId: "zwkjMazxgKBpWjHXE"
      }
    };
    const updatedShipment = await resolvers.Mutation.removeShipmentDocument(
      null,
      args,
      context
    );

    expect(updatedShipment).be.an("object");
    expect(updatedShipment.documents).to.be.an("array");
    expect(updatedShipment.documents).to.have.lengthOf(0);

    // test here
  });
});
