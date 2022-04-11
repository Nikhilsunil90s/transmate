import { Shipment } from "../../shipments/Shipment";
import { ShipmentProject } from "../ShipmentProject";
import {
  CheckProjectSecurity,
  dbFields
} from "/imports/utils/security/checkUserPermissionForProject";

interface RemoveProject {
  accountId: string;
  userId: string;
  projectId?: string;
  project?: any;
  init: (a: { projectId: string }) => Promise<RemoveProject>;
  runChecks: () => Promise<RemoveProject>;
  shipmentAction: (a: {
    linkedShipmentAction: string;
  }) => Promise<RemoveProject>;
  removeProject: () => Promise<RemoveProject>;
  getUIResponse: () => boolean;
}

export const removeProject = ({ accountId, userId }): RemoveProject => ({
  accountId,
  userId,
  async init({ projectId }) {
    this.projectId = projectId;
    this.project = await ShipmentProject.first(projectId, { fields: dbFields });
    return this;
  },
  async runChecks() {
    const check = new CheckProjectSecurity(
      { project: this.project },
      { userId: this.userId, accountId: this.accountId }
    );
    await check.getUserRoles();
    check.can({ action: "removeProject" }).throw();
    return this;
  },
  async shipmentAction({ linkedShipmentAction }) {
    // REMOVE >> flag delete (keep in sync with reporting)
    // UNLINK >> remove the shipmentProjectId from the link
    const [inBoundShipments, outBoundShipments] = await Promise.all([
      Shipment._collection
        .rawCollection()
        .distinct("_id", { shipmentProjectInboundId: this.projectId }),
      Shipment._collection
        .rawCollection()
        .distinct("_id", { shipmentProjectOutboundId: this.projectId })
    ]);

    if (linkedShipmentAction === "REMOVE") {
      const allIds = [inBoundShipments, outBoundShipments].flat();
      if (allIds.length) {
        await Shipment._collection.update(
          { _id: { $in: allIds } },
          {
            $set: {
              deleted: true,
              updated: { by: this.userId, at: new Date() }
            }
          },
          { multi: true }
        );
      }
    }
    if (linkedShipmentAction === "UNLINK") {
      await Promise.all(
        [
          [inBoundShipments, "In"],
          [outBoundShipments, "Out"]
        ].map(([ids, dir]) => {
          if (!ids.length) return null;
          return Shipment._collection.update(
            { _id: { $in: ids } },
            {
              $set: { updated: { by: this.userId, at: new Date() } },
              $unset: { [`shipmentProject${dir}boundId`]: 1 }
            },
            { multi: true }
          );
        })
      );
    }

    return this;
  },
  async removeProject() {
    await this.project.update_async({ deleted: true, status: "disabled" });
    return this;
  },
  getUIResponse() {
    return true;
  }
});
