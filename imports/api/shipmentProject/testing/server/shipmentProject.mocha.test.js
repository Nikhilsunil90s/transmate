/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";
import { generateShipmentProjectData } from "./shipmentProjectTestData";

import { resolvers as projectResolvers } from "../../apollo/resolvers";
import { resolvers as shipmentResolvers } from "/imports/api/shipments/apollo/resolvers";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";

const debug = require("debug")("project:test");

const { expect } = require("chai");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const PROJECT_ID = "RAx8FqXSqPr4uJppf"; // inbound
const INBOUND_SHIPMENT_ID = "Liy2zt3cqqymTKtfj"; // carrierId: C75701
const OUTBOUND_SHIPMENT_ID = "2jG2mZFcaFzqaThcr"; // carrierId: C11051
const ADDRESS_ID = "j958tYA872PAogTDq";

const PARTNER_CONTEXT = {
  accountId: "C11051",
  userId: "pYFLYFDMJEnKADYXX"
};

const SHIPMENT_FIELDS = {
  fields: {
    shipmentProjectInboundId: 1,
    shipmentProjectOutboundId: 1,
    accountId: 1,
    status: 1
  }
};

const PROJECT_FIELDS = {
  fields: {
    inShipmentIds: 1,
    outShipmentIds: 1,
    status: 1,
    accountId: 1
  }
};

let defaultMongo;
describe("shipment-project", function() {
  const context = { userId: USER_ID, accountId: ACCOUNT_ID };
  this.timeout(10000);
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
  beforeEach(function() {
    return resetCollections(["projects", "shipments"]);
  });
  describe("mutations", function() {
    beforeEach(function() {
      return resetCollections(["projects", "shipments"]);
    });
    it("[createShipmentProject] can create shipment project", async function() {
      const input = generateShipmentProjectData(context);
      const project = await projectResolvers.Mutation.createShipmentProject(
        null,
        { input },
        context
      );

      expect(project).to.be.an("object");
      expect(project.id).to.not.equal(undefined);
      expect(project.planners).to.be.an("array");
      expect(project.planners).to.have.lengthOf(1);
      expect(project.planners[0].id).to.equal(USER_ID);
    });
    it("[refreshProjectPartners] refresh project partners", async function() {
      // assume that the partner Account has no access yet:
      const PROJECT_FEATURE_VIEW = "shipmentProjects";
      await AllAccounts._collection.update(
        { _id: "C75701" },
        { $pull: { features: PROJECT_FEATURE_VIEW } }
      );

      // remove partners from project
      await ShipmentProject._collection.update(
        { _id: PROJECT_ID },
        { $set: { partners: [] } }
      );

      // refresh:
      const arg = { shipmentProjectId: PROJECT_ID };
      const result = await projectResolvers.Mutation.refreshProjectPartners(
        null,
        arg,
        context
      );
      debug("refresh project partners result :%j", result);
      expect(result).to.be.an("object");
      expect(result.id).to.equal(PROJECT_ID);

      expect(result.partners).to.deep.include.members([
        { id: "C11051", name: "Carrier Beta" },
        { id: "C75701", name: "Carrier PlayCo" }
      ]);

      // check account access of these newly added accounts:
      const partner = await AllAccounts.first(
        { _id: "C75701" },
        { $fields: { features: 1 } }
      );

      expect(partner.features).to.include(PROJECT_FEATURE_VIEW);
    });

    it("[addExistingShipmentToProject] add outbound shipment", async function() {
      // unlink first:
      await Promise.all([
        Shipment._collection.update(
          { _id: OUTBOUND_SHIPMENT_ID },
          {
            $unset: {
              shipmentProjectInboundId: 1,
              shipmentProjectOutboundId: 1
            }
          }
        ),
        ShipmentProject._collection.update(
          { _id: PROJECT_ID },
          {
            $set: {
              inShipmentIds: [],
              outShipmentIds: []
            }
          }
        )
      ]);

      // now add it and test it:
      const arg = {
        input: {
          shipmentId: OUTBOUND_SHIPMENT_ID, // only linked to outboundProject
          projectId: PROJECT_ID,
          type: "INBOUND"
        }
      };
      const result = await projectResolvers.Mutation.addExistingShipmentToProject(
        null,
        arg,
        context
      );
      debug("addExistingShipmentToProject result :%j", result);
      expect(result)
        .to.be.an("boolean")
        .to.eql(true);

      const [shipment, project] = await Promise.all([
        Shipment.first(OUTBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);
      expect(shipment.shipmentProjectInboundId).to.equal(PROJECT_ID);
      expect(project.inShipmentIds).to.include(OUTBOUND_SHIPMENT_ID);
    });

    it("[removeExistingShipmentFromProject] remove outbound shipment", async function() {
      const arg = {
        input: {
          shipmentId: OUTBOUND_SHIPMENT_ID, // only linked to outboundProject
          projectId: PROJECT_ID,
          type: "OUTBOUND"
        }
      };

      const resultRemove = await projectResolvers.Mutation.removeExistingShipmentFromProject(
        null,
        arg,
        context
      );
      debug("removeExistingShipmentFromProject result :%j", resultRemove);
      expect(resultRemove)
        .to.be.an("boolean")
        .to.eql(true);

      const [shipment, project] = await Promise.all([
        Shipment.first(OUTBOUND_SHIPMENT_ID, {
          fields: { shipmentProjectInboundId: 1, shipmentProjectOutboundId: 1 }
        }),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectOutboundId).to.equal(undefined);
      expect(project.outShipmentIds).to.not.include(OUTBOUND_SHIPMENT_ID);
    });

    it("[createShipmentProject] can copy project group-code to next year", async function() {
      const NEW_YEAR = 2021;
      const GROUP = "F1";
      const CODE = "GP BHR II";
      const input = {
        projectCode: CODE,
        projectGroup: GROUP,
        oldYear: 2020, // optional param
        newYear: NEW_YEAR
      };

      const stats = await projectResolvers.Mutation.initYearForProjectCode(
        null,
        { input },
        context
      );
      debug("copy project stats %o", stats);
      expect(stats.projectIds).to.be.an("array");
      expect(stats.projectIds.length).to.equal(1);
      expect(stats.shipmentIds).to.be.an("array");
      expect(stats.shipmentIds.length).to.equal(2);

      const project = await ShipmentProject.first(stats.projectIds[0]);
      debug(
        "project in %o, out %o",
        project.inShipmentIds,
        project.outShipmentIds
      );
      expect(project.year).to.equal(NEW_YEAR);
      expect(project.inShipmentIds).to.have.lengthOf(1);
      expect(project.outShipmentIds).to.have.lengthOf(1);

      const inBound = await Shipment.where(
        { _id: { $in: project.inShipmentIds } },
        SHIPMENT_FIELDS
      );
      const outBound = await Shipment.where(
        { _id: { $in: project.outShipmentIds } },
        SHIPMENT_FIELDS
      );

      expect(inBound).to.have.lengthOf(1);
      expect(outBound).to.have.lengthOf(1);

      // check account settings:
      const settings = await AllAccountsSettings.first(ACCOUNT_ID, {
        fields: { projectCodes: 1, projectYears: 1 }
      });

      expect(settings).to.not.equal(undefined);
      expect(settings.projectYears).to.include(NEW_YEAR);

      const codeSetting = (settings.projectCodes || []).find(
        ({ code, group }) => code === CODE && group === GROUP
      );
      expect(codeSetting).to.not.equal(undefined);
      expect(codeSetting.lastActiveYear).to.equal(NEW_YEAR);
    });
    it("[editShipmentProject] edit shipment project", async function() {
      const input = {
        projectId: PROJECT_ID,
        title: "TEST - title"
      };

      const res = await projectResolvers.Mutation.editShipmentProject(
        null,
        { input },
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.id).to.be.a("string");

      // test doc:
      const updatedProject = await ShipmentProject.first(PROJECT_ID);
      expect(updatedProject.title).to.equal(input.title);
    });
    it("[editShipmentProjectLocation] edit shipment location", async function() {
      const input = {
        projectId: PROJECT_ID,
        location: {
          id: ADDRESS_ID,
          type: "address"
        }
      };

      const res = await projectResolvers.Mutation.editShipmentProjectLocation(
        null,
        { input },
        context
      );

      expect(res).to.be.an("object");
      expect(res.id).to.equal(PROJECT_ID);
      expect(res.location.addressId).to.equal(ADDRESS_ID);
      expect(res.location.name).to.equal("Globex Belgium");
    });
    it("[editShipmentProjectNotes] edit shipment notes", async function() {
      const args = {
        input: {
          projectId: PROJECT_ID,
          update: {
            year: 2021
          }
        }
      };

      const res = await projectResolvers.Mutation.editShipmentProjectNotes(
        null,
        args,
        context
      );
      expect(res).to.be.an("object");
      expect(res.id).to.equal(PROJECT_ID);
      expect(res.year).to.equal(args.input.update.year);

      // expect(result.location.zipCode).to.equal(input.zipCode);
    });
    it("[removeShipmentProject] remove shipment project - shipments REMOVE", async function() {
      const args = {
        input: { projectId: PROJECT_ID, linkedShipmentAction: "REMOVE" }
      };
      const res = await projectResolvers.Mutation.removeShipmentProject(
        null,
        args,
        context
      );

      expect(res).to.equal(true);

      const project = await ShipmentProject.first(PROJECT_ID);
      expect(project.deleted).to.equal(true);

      const inShipments = await Shipment.where(
        { _id: { $in: project.inShipmentIds } },
        { fields: { deleted: 1 } }
      );
      inShipments.forEach(shipment => expect(shipment.deleted).to.equal(true));

      const outShipments = await Shipment.where(
        { _id: { $in: project.inShipmentIds } },
        { fields: { deleted: 1 } }
      );

      outShipments.forEach(shipment => expect(shipment.deleted).to.equal(true));
    });
    it("[removeShipmentProject] remove shipment project - shipments UNLINK", async function() {
      const args = {
        input: { projectId: PROJECT_ID, linkedShipmentAction: "UNLINK" }
      };
      const res = await projectResolvers.Mutation.removeShipmentProject(
        null,
        args,
        context
      );

      expect(res).to.equal(true);

      const project = await ShipmentProject.first(PROJECT_ID);
      expect(project.deleted).to.equal(true);

      const inShipments = await Shipment.where(
        { _id: { $in: project.inShipmentIds } },
        { fields: { deleted: 1, shipmentProjectInboundId: 1 } }
      );
      inShipments.forEach(shipment =>
        expect(shipment.shipmentProjectInboundId).to.equal(undefined)
      );

      const outShipments = await Shipment.where(
        { _id: { $in: project.inShipmentIds } },
        { fields: { deleted: 1, shipmentProjectOutboundId: 1 } }
      );

      outShipments.forEach(shipment =>
        expect(shipment.shipmentProjectOutboundId).to.equal(undefined)
      );
    });
  });
  describe("query", function() {
    beforeEach(function() {
      return resetCollections(["projects", "shipments"]);
    });
    it("[getShipmentsByShipmentProject] gets shipments and cost totals", async function() {
      const args = {
        input: {
          shipmentProjectId: PROJECT_ID,
          type: "INBOUND"
        }
      };
      const shipments = await projectResolvers.Query.getShipmentsByShipmentProject(
        null,
        args,
        context
      );

      expect(shipments).to.be.an("array");
      expect(shipments).to.have.lengthOf(1);
      expect(shipments[0].costs).to.be.an("array");
      expect(shipments[0].costs).to.have.lengthOf(3);
      expect(shipments[0].costs[2].calculatedExchange).to.equal(
        0.02731640166117904
      );

      expect(shipments[0].firstItem).to.be.an("object");
      expect(shipments[0].firstItem.references).to.be.an("object");
      expect(shipments[0].firstItem.references.containerNo).to.equal(
        "LJ073NH / LJ64GSR"
      );
      expect(shipments[0].firstItem.description).to.not.equal(undefined);
      expect(shipments[0].firstItem.commodity).to.not.equal(undefined);
      expect(shipments[0].firstItem.quantity.code).to.not.equal(undefined);

      const total = shipments[0].costs.reduce((acc, cur) => {
        return acc + cur.calculatedExchange * cur.amount.value;
      }, 0);

      // check if the total has been calculated correctly
      expect(Math.round(shipments[0].totals.total)).to.equal(Math.round(total));
    });

    it("[getShipmentsByShipmentProject] gets shipments for partners WITHOUT cost totals", async function() {
      const args = {
        input: {
          shipmentProjectId: PROJECT_ID,
          type: "INBOUND"
        }
      };
      const shipments = await projectResolvers.Query.getShipmentsByShipmentProject(
        null,
        args,
        PARTNER_CONTEXT
      );

      expect(shipments).to.be.an("array");
      expect(shipments).to.have.lengthOf(1);
      expect(shipments[0].costs).to.equal(undefined);
      expect(shipments[0].totals).to.equal(undefined);

      expect(shipments[0].firstItem).to.be.an("object");
      expect(shipments[0].firstItem.references).to.be.an("object");
      expect(shipments[0].firstItem.references.containerNo).to.equal(
        "LJ073NH / LJ64GSR"
      );
      expect(shipments[0].firstItem.description).to.not.equal(undefined);
      expect(shipments[0].firstItem.commodity).to.not.equal(undefined);
      expect(shipments[0].firstItem.quantity.code).to.not.equal(undefined);
    });

    it("[getShipmentProjects] get projects", async function() {
      const arg = { filters: {} };
      const result = await projectResolvers.Query.getShipmentProjects(
        null,
        arg,
        context
      );
      debug("refresh project partners result :%j", result);
      expect(result).to.be.an("array");
      expect(result[0].accountId).to.equal(ACCOUNT_ID);
    });
    it("[getShipmentProjects] get projects as partner", async function() {
      const arg = { filters: {} };
      const result = await projectResolvers.Query.getShipmentProjects(
        null,
        arg,
        PARTNER_CONTEXT
      );

      expect(result).to.be.an("array");
      expect(result).to.have.lengthOf(1);
    });
  });
  describe("project inShipmentId stays in sync", function() {
    beforeEach(async function() {
      await resetCollections(["projects", "shipments"]);
    });
    it("updates inShipmentIds when shipment copied", async function() {
      // 1. shipment is copied over:

      const newShipmentId = await shipmentResolvers.Mutation.duplicateShipment(
        null,
        { input: { shipmentId: INBOUND_SHIPMENT_ID } },
        context
      );

      expect(newShipmentId).to.not.equal(undefined);
      expect(newShipmentId).to.be.a("string");
      const [shipment, project] = await Promise.all([
        Shipment.first(newShipmentId, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectInboundId).to.equal(PROJECT_ID);
      expect(project.inShipmentIds).to.include(newShipmentId);
    });
    it("updates outShipmentIds when shipment copied", async function() {
      // 1. shipment is copied over:

      const newShipmentId = await shipmentResolvers.Mutation.duplicateShipment(
        null,
        { input: { shipmentId: OUTBOUND_SHIPMENT_ID } },
        context
      );

      expect(newShipmentId).to.not.equal(undefined);
      expect(newShipmentId).to.be.a("string");
      const [shipment, project] = await Promise.all([
        Shipment.first(newShipmentId, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectOutboundId).to.equal(PROJECT_ID);
      expect(project.outShipmentIds).to.include(newShipmentId);
    });
    it("updates inShipmentIds when shipment is canceled", async function() {
      await Shipment._collection.update(INBOUND_SHIPMENT_ID, {
        $set: { status: "draft" }
      });
      await shipmentResolvers.Mutation.cancelShipment(
        null,
        { shipmentId: INBOUND_SHIPMENT_ID },
        context
      );
      const [shipment, project] = await Promise.all([
        Shipment.first(INBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectInboundId).to.equal(PROJECT_ID); // link stays here
      expect(project.inShipmentIds).to.not.include(INBOUND_SHIPMENT_ID);

      // and re-adds if a shipment is uncancelled:
      await shipmentResolvers.Mutation.unCancelShipment(
        null,
        { shipmentId: INBOUND_SHIPMENT_ID },
        context
      );
      const [shipment2, project2] = await Promise.all([
        Shipment.first(INBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment2.shipmentProjectInboundId).to.equal(PROJECT_ID); // link stays here
      expect(project2.inShipmentIds).to.include(INBOUND_SHIPMENT_ID);
    });
    it("updates outShipmentIds when shipment is canceled", async function() {
      await Shipment._collection.update(OUTBOUND_SHIPMENT_ID, {
        $set: { status: "draft" }
      });
      await shipmentResolvers.Mutation.cancelShipment(
        null,
        { shipmentId: OUTBOUND_SHIPMENT_ID },
        context
      );
      const [shipment, project] = await Promise.all([
        Shipment.first(OUTBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectOutboundId).to.equal(PROJECT_ID); // link stays here
      expect(project.outShipmentIds).to.not.include(OUTBOUND_SHIPMENT_ID);

      // and re-adds if a shipment is uncancelled:
      await shipmentResolvers.Mutation.unCancelShipment(
        null,
        { shipmentId: OUTBOUND_SHIPMENT_ID },
        context
      );
      const [shipment2, project2] = await Promise.all([
        Shipment.first(OUTBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment2.shipmentProjectOutboundId).to.equal(PROJECT_ID); // link stays here
      expect(project2.outShipmentIds).to.include(OUTBOUND_SHIPMENT_ID);
    });
    it("updates outShipmentIds when shipment is deleted in mass action", async function() {
      await Shipment._collection.update(OUTBOUND_SHIPMENT_ID, {
        $set: { status: "draft" }
      });
      await shipmentResolvers.Mutation.massActionShipment(
        null,
        { input: { shipmentIds: [OUTBOUND_SHIPMENT_ID], action: "delete" } },
        context
      );

      const [shipment, project] = await Promise.all([
        Shipment.first(OUTBOUND_SHIPMENT_ID, SHIPMENT_FIELDS),
        ShipmentProject.first(PROJECT_ID, PROJECT_FIELDS)
      ]);

      expect(shipment.shipmentProjectOutboundId).to.equal(PROJECT_ID); // link stays here
      expect(project.outShipmentIds).to.not.include(OUTBOUND_SHIPMENT_ID);
    });
  });
});
