import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { DEFAULT_VIEW } from "../enums/views";
import { User } from "../../users/User";

const VIEWS = {
  toPickItems: {
    $or: [
      { pickingStatus: { $in: ["none", "partial"] } },
      { pickingStatus: { $exists: false } }
    ],
    status: "draft"
  },
  packedItems: {
    pickingStatus: "packed",
    status: { $in: ["draft", "started"] }
  },
  toBeShipped: {
    pickingStatus: "printed",
    status: "draft"
  },
  shippedItems: { pickingStatus: "printed", status: { $in: ["started"] } }
};

const FIELDS = {
  _id: 1,
  id: "$_id",
  number: 1,
  tags: 1,
  accountId: 1,
  shipperId: 1,
  providerIds: 1,
  carrierIds: 1,
  type: 1,
  status: 1,
  references: 1,
  pickup: 1,
  delivery: 1,
  pickingStatus: 1,
  created: 1,
  trackingNumbers: 1
};

export const ITEM_FIELDS = {
  type: 1,
  description: 1,
  quantity: 1,
  isPicked: 1,
  isPackingUnit: 1
};

export const getPickingOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ viewKey, addressId, filters = {} }) {
    this.addressId = addressId;
    this.viewKey = viewKey;
    this.filters = filters;

    await User._collection.update(
      { _id: this.userId },
      { $set: { "preferences.picking.addressId": addressId } }
    );
    return this;
  },
  async get() {
    const query = VIEWS[this.viewKey || DEFAULT_VIEW];
    if (!query) throw new Error("View not found");
    const srv = shipmentAggregation(this.context);
    await srv.getUserEntities();
    return srv
      .match({
        fieldsProjection: FIELDS,
        query: [
          {
            "pickup.location.addressId": this.addressId,
            ...query,
            ...this.filters
          }
        ]
      })
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "carrier" })
      .getItems({ depth: 2, fields: ITEM_FIELDS, types: ["HU"] })
      .sort({ "created.at": -1 })
      .fetchDirect();
  }
});
