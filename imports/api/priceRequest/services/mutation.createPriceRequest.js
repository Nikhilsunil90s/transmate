import get from "lodash.get";
import { priceRequestService } from "./priceRequest";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

const debug = require("debug")("price-request:resolver");

export const createPriceRequest = ({ accountId, userId }) => ({
  accountId,
  userId,
  shipmentIds: [],
  verifyItems({ items }) {
    this.items = items || [];
    this.items.forEach(({ shipmentId, params }, i) => {
      if (shipmentId) {
        this.shipmentIds.push(shipmentId);
      }
      if (!shipmentId && !params) {
        throw new Error(`item ${i}: either set shipmentId or parameter object`);
      }
    });
    return this;
  },
  async create({ data }) {
    const prService = await priceRequestService({
      accountId: this.accountId,
      userId: this.userId
    }).verifyItems({ items: this.items });
    const { errors, validItems = [] } = prService;
    debug("prService %o", prService);
    if (validItems.length > 0) {
      debug("async call to set items on pr");
      await prService.create(data);
      await prService.addItems();
      await prService.setShipmentLinks();

      // this part is async (remote call), is already run with "additems"
      // prService.remoteRecalculateItemParams();

      // do a first call to set simulation values
      prService.queueAnalyse();
    } else {
      console.warn("price request initiated without items/shipments!");
    }

    const priceRequestDoc = await prService.get();

    // return shipment for shipment cache update:
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    srv
      .match({
        query: [{ _id: { $in: this.shipmentIds } }],
        options: { noStatusFilter: true, noAccountFilter: true },
        fieldsProjection: {
          priceRequestId: 1
        }
      })
      .getLinks(); // will set linkInbound [], linkOutbound: [] etc... resolver sets this straight

    const shipments = await srv.fetchDirect();

    debug("priceRequestDoc %o", priceRequestDoc);
    return {
      priceRequestId: get(priceRequestDoc, "_id"),
      priceRequest: priceRequestDoc,
      errors,
      validItems: validItems.length,
      shipments
    };
  }
});
