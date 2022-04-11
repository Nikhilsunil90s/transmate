import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Stage } from "/imports/api/stages/Stage";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { ITEM_FIELDS } from "./query.getPickingDetail";

import { confirmDHLOption } from "./DHL/DHL-confirmOption";
import { LabelType } from "./DHL/interfaces.d";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { mockConfirmLabelOption } from "./mocks/mock.confirmLabelOption";

import { CustomsSummary } from "../interfaces/labels.d";
import { Random } from "/imports/utils/functions/random";
import { toTitleCase } from "/imports/utils/functions/fnStringToTitleCase";

const debug = require("debug")("shipmentpicking:labeloption:mutation");

const SHIPMENT_FIELDS = {
  carrierIds: 1,
  status: 1,
  pickup: 1,
  delivery: 1,
  incoterm: 1,
  pickingStatus: 1,
  references: 1,
  number: 1,
  costParams: 1
};

interface ConfirmShipmentLabelOption {
  accountId: string;
  userId: string;
  packingItemIds?: string[];
  customs?: CustomsSummary;
  entity?: any;
  label?: LabelType;
  init: (
    this: ConfirmShipmentLabelOption,
    a: { packingItemIds: string[] }
  ) => Promise<ConfirmShipmentLabelOption>;
  getCustomsValues: (
    this: ConfirmShipmentLabelOption
  ) => Promise<ConfirmShipmentLabelOption>;
  confirmOption: (
    this: ConfirmShipmentLabelOption,
    a: { rateOptionId: string; rate: Object }
  ) => Promise<ConfirmShipmentLabelOption>;
  storeLabelInfo: (
    this: ConfirmShipmentLabelOption
  ) => Promise<ConfirmShipmentLabelOption>;
  setShipmentAllocation: (
    this: ConfirmShipmentLabelOption
  ) => Promise<ConfirmShipmentLabelOption>;
  getUIResponse: (
    this: ConfirmShipmentLabelOption
  ) => Promise<{ shipment: Object; labelUrl: string }>;
}

export const confirmShipmentLabelOption = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ packingItemIds }) {
    this.packingItemIds = packingItemIds;
    this.items = await ShipmentItem.where({
      _id: { $in: packingItemIds },
      isPackingUnit: true
    });
    if (!this.items.length && !this.items[0].shipmentId)
      throw new Error("Item not found");
    debug("get data for shipment id :%s", this.items[0].shipmentId);

    this.shipmentId = this.items[0].shipmentId;
    this.shipment = await Shipment.first(this.shipmentId, {
      // @ts-ignore: FIXME: ts error
      fields: SHIPMENT_FIELDS
    });

    if (!this.shipment) throw new Error("Item shipment not found");

    let account;
    [this.accountSettings, account] = await Promise.all([
      AllAccountsSettings.first(accountId, {
        fields: { shippingLabelServices: 1 }
      }),
      await AllAccounts.first(accountId, {
        fields: { entities: 1 }
      })
    ]);

    if (this.shipment.costParams?.entity) {
      this.entity = (account.entities || []).find(
        ({ code }) => code === this.shipment.costParams.entity
      );
    }

    return this;
  },

  async getCustomsValues() {
    this.customs = await ShipmentItem._collection.aggregate([
      { $match: { parentItemId: { $in: this.packingItemIds } } },
      { $match: { "customs.HScode": { $exists: true } } },
      {
        $group: {
          _id: {
            HScode: "$customs.HScode",
            description: {
              $ifNull: ["$commodity", "$description"]
            },
            unitPrice: "$customs.value",
            currency: "$customs.currency",
            weight_unit: "$weight_unit"
          },
          quantity: { $sum: "$quantity.amount" },
          value: { $sum: "$customs.value" },
          weight_net: { $sum: "$weight_net" },
          weight_gross: { $sum: "$weight_gross" }
        }
      },
      {
        $project: {
          HScode: "$_id.HScode",
          description: "$_id.description",
          unitPrice: "$_id.unitPrice",
          currency: "$_id.currency",
          weight_unit: "$_id.weight_unit",
          quantity: 1,
          value: 1,
          weight_net: 1,
          weight_gross: 1
        }
      }
    ]);

    return this;
  },

  /**
   * step to do remote action and get label info back
   * @param {{rateOptionId: String!, rate: Object}} param0
   * @returns this
   */
  async confirmOption({ rateOptionId, rate }) {
    let label: LabelType;
    let trackingNumbers: Object;
    let rateRequest: Object;
    let operationType: string;

    // returns selected serviceType in dhlexpress
    const dhlSettings = this.accountSettings.shippingLabelServices.dhlexpress;

    // mocked response
    if (process.env.MOCK_confirmLabelOption) {
      ({
        label,
        trackingNumbers,
        rateRequest,
        operationType
      } = mockConfirmLabelOption({ items: this.items }));
    } else {
      // TODO [$6130a08837762e00094fd3d6]: if there are other services: they would be confirmed here depending on the partner:
      ({
        label,
        trackingNumbers,
        rateRequest,
        operationType
      } = await confirmDHLOption({
        shipment: this.shipment,
        items: this.items,
        customs: this.customs,
        entity: this.entity,
        settings: dhlSettings,
        rateOptionId,

        // @ts-ignore: FIXME: ts error
        rate
      }));
    }

    this.label = label;
    this.trackingNumbers = trackingNumbers || {};
    this.rateRequest = rateRequest;
    this.operationType = operationType;
    return this;
  },

  // store information in item
  async storeLabelInfo() {
    await Promise.all(
      this.items.map(({ id }) =>
        ShipmentItem._collection.update(
          { _id: id },
          {
            $set: {
              "edi.label": this.label, // {object_id = transactionId that is needed for cancellation}
              "edi.rateRequest": this.rateRequest,
              "edi.operationType": this.operationType,
              "edi.trackingNumber": this.trackingNumbers[id],
              "references.trackingNumber": this.trackingNumbers[id],
              labelUrl: this.label?.labelUrl
            }
          }
        )
      )
    );
    this.labelUrl = this.label?.labelUrl;
    return this;
  },

  /**
   * checks the carrierId in stage/shipment -> if not set, it will set the carrierId
   * @returns {this}
   */
  async setShipmentAllocation() {
    const [allPackingUnits, packingUnitsWithLabel] = await Promise.all([
      ShipmentItem.count({
        shipmentId: this.shipmentId,
        type: "HU",
        isPackingUnit: true
      }),
      ShipmentItem.count({
        shipmentId: this.shipmentId,
        type: "HU",
        isPackingUnit: true,
        labelUrl: { $exists: true }
      })
    ]);
    const allPackingUnitsPrinted = allPackingUnits === packingUnitsWithLabel;
    const updatePickingStatus =
      this.shipment.pickingStatus === "packed" && allPackingUnitsPrinted;

    const { carrierId } = this.label;
    await Promise.all([
      Shipment._collection.update(
        { _id: this.shipmentId },
        {
          $set: {
            ...(carrierId ? { carrierIds: [carrierId] } : {}), // only 1 carrier per shipment > if not -> split shipment
            type: "parcel",

            // TODO [#390]: Jan:
            // serviceLevel -> take the service level of the carrier??
            ...(updatePickingStatus ? { pickingStatus: "printed" } : {})
          },
          $push: {
            updates: {
              action: "pickingLabel",
              ts: new Date(),
              data: { itemIds: this.packingItemIds },
              userId: this.userId,
              accountId: this.accountId
            },
            trackingNumbers: { $each: Object.values(this.trackingNumbers) },
            ...(this.label.costs?.length
              ? {
                  costs: {
                    $each: this.label.costs.map(
                      ({
                        costId,
                        isManualBaseCost,
                        description,
                        source,
                        meta,
                        amount
                      }) => ({
                        id: Random.id(6),
                        costId,
                        isManualBaseCost,
                        description: toTitleCase(description),
                        source,
                        meta: {
                          ...meta,
                          packingItemIds: this.packingItemIds
                        },
                        amount,
                        added: {
                          by: this.userId,
                          at: new Date()
                        },
                        accountId: this.accountId,
                        sellerId: this.label.carrierId,
                        date: new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          new Date().getDate()
                        )
                      })
                    )
                  }
                }
              : {})
          }
        }
      ),
      Stage._collection.update(
        { shipmentId: this.shipmentId },
        {
          $set: {
            ...(carrierId ? { carrierId } : {}),
            mode: "parcel"
          }
        }
      )
    ]);

    return this;
  },

  async getUIResponse() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });

    await srv.getUserEntities();
    const arr = await srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        // @ts-ignore: FIXME: ts error
        fieldsProjection: {
          status: 1,
          pickingStatus: 1,
          carrierIds: 1,
          trackingNumbers: 1
        }
      })
      .getItems({ depth: 4, fields: ITEM_FIELDS, types: ["HU"] })
      .fetchDirect();

    return { shipment: arr[0], labelUrl: this.labelUrl };
  }
});
