/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { Shipment } from "../Shipment";
import { resolvers } from "/imports/api/shipments/apollo/resolvers.js";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID_WITH_COSTS = "2jG2mZFcaFzqaThcr";

let defaultMongo;

describe("[shipment] mass actions", function() {
  const context = {
    userId: USER_ID,
    accountId: ACCOUNT_ID
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
  beforeEach(async function() {
    await resetCollections(["shipments"]);
  });
  it("[archive] archives shipments", async function() {
    const { success, errors } = await resolvers.Mutation.massActionShipment(
      null,
      {
        input: {
          action: "archive",
          shipmentIds: [SHIPMENT_ID_WITH_COSTS]
        }
      },
      context
    );

    expect(errors).to.have.lengthOf(
      0,
      `this are the errors:${JSON.stringify(errors)}`
    );
    expect(success).to.eql([SHIPMENT_ID_WITH_COSTS]);

    const updatedShipment = await Shipment.first(SHIPMENT_ID_WITH_COSTS, {
      fields: { isArchived: 1 }
    });
    expect(updatedShipment.isArchived).to.equal(true);
  });
  it("[cancel] cancel shipments", async function() {
    const { success, errors } = await resolvers.Mutation.massActionShipment(
      null,
      {
        input: {
          action: "cancel",
          shipmentIds: [SHIPMENT_ID_WITH_COSTS]
        }
      },
      context
    );

    expect(errors).to.have.lengthOf(0);
    expect(success).to.eql([SHIPMENT_ID_WITH_COSTS]);

    const updatedShipment = await Shipment.first(SHIPMENT_ID_WITH_COSTS);
    expect(updatedShipment.status).to.equal("canceled");
  });
  it("[delete] delete shipments", async function() {
    const { success, errors } = await resolvers.Mutation.massActionShipment(
      null,
      {
        input: {
          action: "delete",
          shipmentIds: [SHIPMENT_ID_WITH_COSTS]
        }
      },
      context
    );

    expect(errors).to.have.lengthOf(0);
    expect(success).to.eql([SHIPMENT_ID_WITH_COSTS]);

    const updatedShipment = await Shipment.first(SHIPMENT_ID_WITH_COSTS);

    expect(updatedShipment.deleted).to.equal(true);
  });
});
