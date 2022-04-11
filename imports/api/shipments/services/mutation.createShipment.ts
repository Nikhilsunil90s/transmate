import { JobManager } from "../../../utils/server/job-manager";
import pick from "lodash.pick";

// collections
import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { Stage } from "/imports/api/stages/Stage";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import { Address } from "/imports/api/addresses/Address";
import { Location } from "/imports/api/locations/Location";

import { CheckFeatureSecurity } from "/imports/utils/security/checkUserPermissionsForFeatures";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

import { setShipmentNotificationFlags } from "/imports/api/notifications/helpers/setShipmentNotificationFlags.js";
import { ShipmentType } from "../interfaces/Shipment";
import { StageType } from "../../stages/interfaces/Stage";

const debug = require("debug")("shipment:resolvers:create");

interface createProps {
  pickup: any;
  delivery: any;
  projectType?: "inbound" | "outbound";
  projectId?: string;
  isRequest?: boolean;
}

interface CreateShipmentSrv {
  accountId: string;
  userId: string;
  isRequest?: boolean;
  projectType?: string;
  projectId?: string;
  stageIds?: Array<string>;
  newShipmentId?: string;
  runChecks: (this: CreateShipmentSrv) => Promise<CreateShipmentSrv>;
  create: (
    this: CreateShipmentSrv,
    a: createProps
  ) => Promise<CreateShipmentSrv>;
  addToProject: (this: CreateShipmentSrv) => Promise<CreateShipmentSrv>;
  triggerNotifications: (this: CreateShipmentSrv) => void;
  get: (this: CreateShipmentSrv) => string;
}

export const createShipment = ({ accountId, userId }): CreateShipmentSrv => ({
  accountId,
  userId,
  async runChecks() {
    const featureCheck = new CheckFeatureSecurity({}, { userId, accountId });
    await featureCheck.getDoc();
    featureCheck.can({ feature: "shipment" }).throw();
    const roleCheck = new CheckShipmentSecurity({}, { userId, accountId });
    await roleCheck.getUserRoles();

    // TODO: split out test: if user is creating a request -> check should be loose
    roleCheck.can({ action: "createShipment" }).throw();
    return this;
  },
  async create({ pickup, delivery, projectType, projectId, isRequest }) {
    this.isRequest = isRequest;

    // project:
    this.projectType = projectType && projectType.toLowerCase();
    this.projectId = projectId;

    const shipment: Partial<ShipmentType> = {};
    let stage: Partial<StageType> = {};
    const accountType = AllAccounts.getType(this.accountId);

    // Fetch pickup and destination location name
    await Promise.all(
      Object.entries({ pickup, delivery }).map(async ([property, stop]) => {
        let address;
        let location;
        const stageProperty = property === "pickup" ? "from" : "to";
        if (stop.location.type === "address") {
          debug("lookup address id %o", stop.location.id);
          address = await Address.first(
            {
              _id: stop.location.id,
              "accounts.id": accountId // only if I am linked
            },
            Address.projectFields(accountId)
          );
          debug(
            "lookup %s , lets use this address %o",
            stop.location.id,
            address
          );

          if (!address) {
            throw new Error(
              "not-allowed: This address is not in your address book."
            );
          }

          address = {
            latLng: address.location,
            countryCode: address.countryCode,
            zipCode: address.zip,
            timeZone: address.timeZone,
            name: address.getName(),
            addressId: address._id,
            address: pick(address, "street", "number", "bus", "city", "state")
          };
          shipment[property] = {
            location: address
          };
          stage[stageProperty] = address;
        } else if (stop.location.type === "location") {
          location = await Location.first(stop.location.id);
          location = Object.assign(
            pick(location, "latLng", "countryCode", "name", "timeZone"),
            {
              locode: {
                id: location.id,
                code: location.locationCode,
                function: location.function
              }
            }
          );
          shipment[property] = { location };
          stage[stageProperty] = location;
        }
        shipment[property].date = stop.date;
        shipment[property].datePlanned = stop.date; // de-normalizaion of dates
        return shipment;
      })
    );

    // Copy requested dates to stage planned dates
    stage = {
      ...stage,
      dates: {
        pickup: { arrival: { planned: shipment.pickup.date } },
        delivery: { arrival: { planned: shipment.delivery.date } }
      }
    };
    if (projectType === "inbound") {
      shipment.shipmentProjectInboundId = projectId;
    } else if (projectType === "outbound") {
      shipment.shipmentProjectOutboundId = projectId;
    }

    // set accountids
    shipment.accountId = accountId;
    if (accountType === "shipper") {
      shipment.shipperId = accountId;
    } else if (accountType === "carrier") {
      stage.carrierId = accountId;
    } else if (accountType === "provider") {
      shipment.providerIds = [accountId];
    }
    shipment.created = {
      by: this.userId,
      at: new Date()
    };
    shipment.updated = shipment.created;

    // if shipment request >>
    if (isRequest) {
      shipment.request = {
        requestedOn: new Date(),
        by: this.userId,
        accountId: this.accountId,
        status: "draft"
      };
    }

    const shipmentN = await Shipment.create_async(shipment);
    const { _id: stageId } = await Stage.create_async({
      ...stage,
      shipmentId: shipmentN._id
    });
    this.stageIds = [stageId];
    this.newShipmentId = shipmentN._id;

    // set notifications
    setShipmentNotificationFlags({
      shipmentId: shipmentN._id
    }).setAfterCreation();
    return this;
  },
  async addToProject() {
    const { projectType, projectId } = this;
    if (projectType && projectId) {
      const shipmentProject = await ShipmentProject.first(projectId);
      const attrToUpdate = {};
      if (projectType === "inbound") {
        const inShipmentIds = shipmentProject.inShipmentIds || [];
        inShipmentIds.push(this.newShipmentId);
        attrToUpdate.inShipmentIds = inShipmentIds;
      } else if (projectType === "outbound") {
        const outShipmentIds = shipmentProject.outShipmentIds || [];
        outShipmentIds.push(this.newShipmentId);
        attrToUpdate.outShipmentIds = outShipmentIds;
      }
      shipmentProject.update(attrToUpdate);
    }

    return this;
  },

  triggerNotifications() {
    if (!this.isRequest) {
      JobManager.post("shipment.created", {
        userId: this.userId,
        accountId: this.accountId,
        shipmentId: this.newShipmentId
      });
    }
  },
  get() {
    return this.newShipmentId;
  }
});
