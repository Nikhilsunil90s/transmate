import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { getDHLOptions } from "./DHL/DHL-getOptions";
import { mockGetLabelOptions } from "./mocks/mock.getLabelOptions";

const debug = require("debug")("shipmentpicking:getLabelsOptions:query");

/**
 * calls the parcel api and returns all rates in an array
 * we return the options to the client
 * the user will then choose an option
 * the rateId is what the api requires
 *
 * @param {*} param0
 * @returns
 */
export const getShipmentLabelOptions = ({ accountId, userId }) => ({
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
    this.shipment = await Shipment.first(this.items[0].shipmentId);
    this.accountSettings = await AllAccountsSettings.first(accountId, {
      fields: { shippingLabelServices: 1 }
    });
    if (!this.shipment) throw new Error("Item shipment not found");
    return this;
  },

  async getOptions() {
    debug("get shipment options, %o", this);

    // mocked response
    if (process.env.MOCK_getLabelOptions) {
      return mockGetLabelOptions;
    }

    // calling the external api(s)
    const dhlSettings = this.accountSettings.shippingLabelServices?.dhlexpress;

    // each service can return an option (dhl, fedex, etc...)
    const [DHLResults] = await Promise.all([
      getDHLOptions({
        settings: dhlSettings,
        shipment: this.shipment,
        items: this.items // packing unit level
      })
    ]);
    return DHLResults;
  }
});
