import get from "lodash.get";
import { JobManager } from "../../../utils/server/job-manager.js";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { User } from "/imports/api/users/User";
import {
  refreshPartners,
  initializeYear,
  unlinkShipmentFromProject,
  addShipmentToProject,
  removeProject
} from "../services/_mutations";
import { getShipmentsByShipmentProject } from "/imports/api/shipmentProject/services/query.getShipmentsByShipmentProject";
import { getAvailableShipments } from "/imports/api/shipmentProject/services/query.getAvailableShipments";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckProjectSecurity } from "/imports/utils/security/checkUserPermissionForProject";
import { parseAddress } from "/imports/api/shipments/services/parseAddress";
import { objDefault } from "/imports/utils/functions/fnObjectDefault";

const debug = require("debug")("project:resolvers");

export const resolvers = {
  ShipmentProject: {
    canEdit: (project, args, { accountId, userId }) => {
      return new CheckProjectSecurity({ project }, { accountId, userId })
        .can({ action: "editProject" })
        .check();
    },
    inCount: project => get(project, ["inShipmentIds", "length"], 0),
    outCount: project => get(project, ["outShipmentIds", "length"], 0)
  },

  Query: {
    async getShipmentProject(root, args, context) {
      try {
        const { accountId, userId } = context;
        SecurityChecks.checkLoggedIn(userId);

        debug("getShipmentProject %o", args);
        return ShipmentProject.first({
          _id: args.shipmentProjectId,
          $or: [{ accountId }, { "partners.id": accountId }]
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentProjects(root, args, context) {
      try {
        debug("getShipmentProjects %o", args);
        const { filters } = args || {};
        const { accountId, userId } = context;
        SecurityChecks.checkLoggedIn(userId);
        const { group, year, status } = filters || {};
        return ShipmentProject.where(
          {
            $and: [
              { $or: [{ accountId }, { "partners.id": accountId }] },
              {
                ...(group ? { "type.group": group } : {}),
                ...(year ? { year } : {}),
                ...(status ? { status } : {})
              },
              { deleted: { $ne: true } }
            ]
          },
          { sort: { eventDate: -1, "created.at": -1 } }
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentsByShipmentProject(root, args = {}, context) {
      debug("getShipmentsByShipmentProject %o", { root, args, context });
      try {
        const { accountId, userId } = context;
        SecurityChecks.checkLoggedIn(userId);

        const { shipmentProjectId, type } = args.input || {};

        const srv = getShipmentsByShipmentProject({
          accountId,
          userId
        });

        await srv.init({ shipmentProjectId });
        return srv.get({
          type
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async getAvailableShipments(root, args, context) {
      debug("getAvailableShipments %o", args);
      try {
        const { userId, accountId } = context;
        SecurityChecks.checkLoggedIn(userId);

        const { type } = args;
        const shipments = await getAvailableShipments({ accountId }).get({
          type
        });

        debug(
          "getAvailableShipments for type %s, for user %s, count: %s",
          type,
          userId,
          shipments.length
        );
        return shipments;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },

  Mutation: {
    async createShipmentProject(_, { input }, { userId, accountId }) {
      SecurityChecks.checkLoggedIn(userId);

      const usr = await User.profile(userId);

      const project = await ShipmentProject.create_async({
        ...input,
        accountId,
        planners: [
          {
            id: usr.id,
            name: usr.getName()
          }
        ],
        status: "active",
        updated: { by: userId, at: new Date() }
      });

      JobManager.post("shipment-project.created", {
        userId,
        accountId,
        projectId: project._id
      });
      return project;
    },
    async editShipmentProject(_, { input }, { userId }) {
      SecurityChecks.checkLoggedIn(userId);
      const { projectId } = input;
      const shipmentProject = await ShipmentProject.first(projectId);
      const updated = await shipmentProject.update_async(input);
      return updated;
    },
    async editShipmentProjectLocation(_, { input }, { userId, accountId }) {
      SecurityChecks.checkLoggedIn(userId);
      const { projectId, location } = input;
      const shipmentProject = await ShipmentProject.first(projectId);

      // get addressInfo:
      const { address, location: addrLoc } = await parseAddress({
        location,
        accountId
      });
      const locationUpdate = address || addrLoc;
      if (!locationUpdate)
        throw new Error("not-found", "Location not found in db");

      await shipmentProject.update_async({ location: locationUpdate });
      return shipmentProject.reload();
    },
    async editShipmentProjectNotes(_, { input }, { userId }) {
      SecurityChecks.checkLoggedIn(userId);
      const { projectId, update } = input;
      const shipmentProject = await ShipmentProject.first(projectId);

      // security checks here

      const updateClean = objDefault(update);
      if (Object.keys(updateClean).length) {
        await shipmentProject.update_async(updateClean);
      }
      return shipmentProject.reload();
    },
    async removeExistingShipmentFromProject(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { shipmentId, projectId, type } = input;

      const srv = unlinkShipmentFromProject({ userId, accountId });
      await srv.init({ shipmentId, projectId, type });
      await srv.unlink();
      return srv.getUIResponse();
    },
    async addExistingShipmentToProject(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { shipmentId, projectId, type } = input;

      const srv = addShipmentToProject({ accountId, userId });
      await srv.init({ shipmentId, projectId });
      await srv.addShipment({ type });
      return srv.getUIResponse();
    },
    async refreshProjectPartners(root, args, context) {
      debug("refreshProjectPartners %o", args);
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentProjectId } = args;
      if (!shipmentProjectId)
        throw Error("refreshProjectPartners:shipmentProjectId not set!");
      try {
        const srv = refreshPartners({ accountId });
        await srv.getProject({ shipmentProjectId });
        await srv.getPartners();
        await srv.saveInProject();
        await srv.giveAccountsAccessToProjectsOverview();

        const partners = srv.getUIResponse();

        return partners;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async initYearForProjectCode(root, { input }, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { projectCode, projectGroup, newYear, oldYear } = input;
      debug("initializing year for project %o", input);
      const srv = initializeYear(context);
      await srv.initialize({ projectCode, projectGroup, newYear, oldYear });
      const res = srv.getStats();

      return res;
    },
    async removeShipmentProject(root, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { projectId, linkedShipmentAction } = input;

      const srv = removeProject({ accountId, userId });
      await srv.init({ projectId });
      await srv.runChecks();
      await srv.shipmentAction({ linkedShipmentAction });
      await srv.removeProject();
      return srv.getUIResponse();
    }
  }
};
