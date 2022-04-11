/* eslint-disable camelcase */
import get from "lodash.get";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { Shipment } from "/imports/api/shipments/Shipment";

import { shipmentCopy } from "/imports/api/shipments/services/shipment-copy";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";

const debug = require("debug")("project:resolver");

export const initializeYear = ({ accountId, userId }) => ({
  accountId,
  userId,
  newProjectIds: [],
  newShipmentIds: [],
  async initialize({ projectCode, projectGroup, newYear, oldYear }) {
    // get projects for this code/group
    // get shipments for these projects
    // copy projects, copy shipments (skip interproject shipments)

    const year = oldYear || newYear - 1;

    const projects = await ShipmentProject.where({
      "type.code": projectCode,
      "type.group": projectGroup,
      year,
      accountId
    });

    debug("found %s to copy", projects.length);

    await Promise.all(
      projects.map(async ({ __is_new, _id, id: projectId, ...project }) => {
        // create new project:
        const newProject = await ShipmentProject.create_async({
          ...project,
          year: newYear,
          title: `${get(project, "type.code")} ${newYear}`,
          inShipmentIds: [],
          outShipmentIds: [],
          created: { by: this.userId, at: new Date() },
          updated: { by: this.userId, at: new Date() }
        });

        debug("copied %s to new project with id %s", projectId, newProject.id);
        const newProjectId = newProject.id;
        this.newProjectIds.push(newProjectId);

        // either inbound or outbound (we are skipping the duals)
        await Promise.all(
          ["In", "Out"].map(async dir => {
            const shipments = await Shipment.where(
              {
                $and: [
                  { [`shipmentProject${dir}boundId`]: projectId },
                  {
                    $or: [
                      { shipmentProjectInboundId: { $exists: false } },
                      { shipmentProjectOutboundId: { $exists: false } }
                    ]
                  }
                ]
              },
              { fields: { _id: 1 } }
            );

            // copy these shipments:
            const shipmentOverrides = {
              [`shipmentProject${dir}boundId`]: newProjectId
            };
            const shipmentIds = await Promise.all(
              shipments.map(async ({ id: shipmentId }) => {
                const srv = shipmentCopy({ accountId, userId });
                await srv.init({
                  shipmentId,
                  options: { omitProjectFields: true }
                });
                await srv.copyShipment();
                await srv.copyItems();
                await srv.copyStages();
                await srv.updateShipment(shipmentOverrides);
                return srv.getId();
              })
            );

            this.newShipmentIds = [...this.newShipmentIds, ...shipmentIds];
            debug("update project set ShipmentIds %o", this.newShipmentIds);
            return newProject.update({
              [`${dir.toLocaleLowerCase()}ShipmentIds`]: shipmentIds
            });
          })
        );
      })
    );

    // update account.settings:
    const settings = await AllAccountsSettings.first(this.accountId, {
      fields: { projectCodes: 1, projectYears: 1 }
    });

    await settings.push({ projectYears: newYear }, true);
    const projectCodeIdx = (settings.projectCodes || []).findIndex(
      ({ code, group }) => code === projectCode && group === projectGroup
    );
    await settings.update({
      [`projectCodes.${projectCodeIdx}.lastActiveYear`]: newYear
    });
    return this;
  },
  getStats() {
    return { projectIds: this.newProjectIds, shipmentIds: this.newShipmentIds };
  }
});
