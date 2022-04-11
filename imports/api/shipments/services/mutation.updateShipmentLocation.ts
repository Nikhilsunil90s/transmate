import { Shipment } from "../Shipment";
import { Stage } from "../../stages/Stage";
import SecurityChecks from "/imports/utils/security/_security";
import { shipmentAggregation } from "./query.pipelineBuilder";
import {
  CheckShipmentSecurity,
  requiredDbFields
} from "/imports/utils/security/checkUserPermissionForShipment";

interface LocationOverridesInput {
  city?: string;
  zipCode?: string;
  countryCode?: string;
  street?: string;
  number?: string;
  name?: string;
  phoneNumber?: string;
  companyName?: string;
}

interface UpdateShipmentLocation {
  accountId: string;
  userId: string;
  shipmentId?: string;
  shipment?: any;
  init: ({ shipmentId: string }) => Promise<UpdateShipmentLocation>;
  runChecks: () => Promise<UpdateShipmentLocation>;
  updateLocation: (a: {
    locationType: "pickup" | "delivery";
    updates: LocationOverridesInput;
  }) => Promise<UpdateShipmentLocation>;
  getUIResponse: () => Promise<any>;
}

const KEY_MAP = {
  // <from> : <to>
  city: "address.city",
  street: "address.street",
  number: "address.number",
  zipCode: "zipCode",
  countryCode: "countryCode",
  name: "name",
  phoneNumber: "phoneNumber",
  companyName: "companyName"
};

const STAGE_LOCATION_MAP = {
  pickup: "from",
  delivery: "to"
};

/** updates location from shipment (similar to updateStage location), but with focus on the from & to of the shipment itself
 * it will sync the stages
 * Used in shipmentPicking >> where addresses might be too long prior to sending them to the parcel carrier
 */
export const updateShipmentLocation = ({
  accountId,
  userId
}): UpdateShipmentLocation => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      // @ts-ignore FIXME TS
      fields: requiredDbFields
    });

    SecurityChecks.checkIfExists(this.shipment);
    return this;
  },
  async runChecks() {
    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "updateLocation" }).throw();
    return this;
  },
  async updateLocation({ locationType, updates }) {
    // we use dot.transform to set the address object correct:
    const shipmentLocationUpdate = Object.entries(updates).reduce(
      (acc, [k, v]) => {
        if (v != null) {
          acc[`${locationType}.location.${KEY_MAP[k]}`] = v;
        }
        return acc;
      },
      {}
    );
    const stageLocationType = STAGE_LOCATION_MAP[locationType];
    const stageLocationUpdate = Object.entries(updates).reduce(
      (acc, [k, v]) => {
        if (v != null) {
          acc[`${stageLocationType}.${KEY_MAP[k]}`] = v;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(shipmentLocationUpdate).length > 0) {
      const updateStage = async () => {
        const stages = await this.shipment.getStages();
        let stageToModify;
        if (locationType === "pickup") {
          [stageToModify] = stages;
        } else {
          [stageToModify] = stages.slice(-1);
        }
        return Stage.init(stageToModify).update_async(stageLocationUpdate);
      };
      await Promise.all([
        this.shipment.update_async(shipmentLocationUpdate),
        updateStage()
      ]);
    }
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        options: { noStatusFilter: true },
        fieldsProjection: {
          pickup: 1,
          delivery: 1
        }
      })

      .getStages({
        fields: {
          id: "$_id",
          from: 1,
          to: 1,

          drivingDistance: 1,
          drivingDuration: 1,
          sphericalDistance: 1
        }
      });
    const res = await srv.fetchDirect(true);
    return res[0] || {};
  }
});
