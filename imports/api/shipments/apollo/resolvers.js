import get from "lodash.get";
import pick from "lodash.pick";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import SecurityChecks from "/imports/utils/security/_security";
import { calculateShipmentAndInvoiceTotal } from "../services/query.helpers";
import { ShipmentService } from "../services/shipments";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

import {
  selectCarrier,
  updateShipment,
  resetShipmentCosts,
  approveDeclineShipmentCosts,
  editShipmentCosts,
  copyShipment,
  createShipment,
  massAction,
  updatePartners,
  updateTags,
  unlinkPriceRequestFromShipment,
  updateShipmentLocation,
  confirmShipmentRequest
} from "../services/_mutations";

import {
  getShipmentChanges,
  getShipmentCosts,
  getShipmentDocuments,
  getShipmentPartners,
  getShipmentInfoHeader,
  getShipmentLinks,
  getShipment,
  getShipmentTrackingInfo,
  getShipmentForAddress,
  getShipmentBillingInfo
} from "../services/_queries";

import { Document } from "/imports/api/documents/Document";

const debug = require("debug")("shipment:resolver");

export const resolvers = {
  Shipment: {
    shipper: (shipment, args, { loaders }) => {
      debug(
        "fetch shipper() for shipment %s shipperId %s",
        shipment._id,
        shipment.shipperId
      );
      if (!shipment.shipperId) return {};
      return loaders.allAccountsLoader.load(shipment.shipperId);
    },
    carrier: (shipment, args, { loaders }) => {
      const carrierId = get(shipment, "carrierIds[0]");
      debug(
        "fetch getFirstCarrier() for shipment %s carrier %s",
        shipment._id,
        carrierId
      );
      if (!carrierId) return {};
      return loaders.allAccountsLoader.load(carrierId);
    },
    firstItem: (shipment, args) => {
      const item = ShipmentItem.first({
        shipmentId: shipment._id,
        ...(args.type ? { type: args.type } : undefined)
      });
      return item;
    },
    firstEquipment: shipment => {
      const item = ShipmentItem.first(
        {
          shipmentId: shipment._id,
          type: "TU"
        },
        { fields: { description: 1 } }
      );
      return item;
    },
    nestedItems: (shipment, args) => {
      // returns the items from the new nested structure
      const { depth } = args;
      const items = ShipmentItem.find({
        shipmentId: shipment._id,
        ...(depth ? { level: { $lte: depth } } : undefined)
      }).fetch();
      return items;
    },
    isTendered: shipment => {
      return shipment.isTendered();
    },
    totalCost: shipment => {
      return shipment.getTotalCost();
    },
    manualCost: shipment => {
      return shipment.getManualCost();
    },
    stage: (shipment, args, { loaders }) => {
      debug("fetch stage() for shipment %o", shipment.stageIds);
      if (!shipment.stageIds) return [];
      return loaders.stageLoader.loadMany(shipment.stageIds);
    },
    deliveryDate: shipment => {
      return get(shipment, ["delivery", "date"]);
    },
    pickupDate: shipment => {
      return get(shipment, ["pickup", "date"]);
    },
    canViewCosts: (shipment, args, { userId, accountId }) => {
      return new CheckShipmentSecurity({ shipment }, { userId, accountId })
        .can({ action: "viewCostSection" })
        .check();
    }
  },
  ShipmentAggr: {
    // canViewCosts: shipment => {
    //   return new CheckShipmentSecurity({ shipment })
    //     .can({ action: "viewCostSection" })
    //     .check();
    // },
    costDetail: async (doc = {}) => {
      // requires .getInvoiceHeaders({ invoiceId }); in the aggr pipeline
      const { invoices, ...shipment } = doc;
      if (!shipment) return null;
      const costDetails = await calculateShipmentAndInvoiceTotal({
        shipment,
        invoices
      }).get();

      return costDetails;
    },
    documents: (doc = {}) => {
      const { documents = [] } = doc;

      return documents.map(document => {
        const documentM = new Document(document);
        const url = documentM.url();
        const icon = documentM.icon();

        return {
          ...document,
          url,
          icon
        };
      });
    },

    // requires getLinks pipeline stage
    links: (shipment = {}) => {
      const projectInboundMap = ({ id, type, title, status }) => ({
        id,
        type: "projectInbound",
        data: { type, title, status }
      });
      const projectoutboundMap = ({ id, type, title, status }) => ({
        id,
        type: "projectOutbound",
        data: { type, title, status }
      });
      const priceRequestMap = ({ id, status, title }) => ({
        id,
        type: "priceRequest",
        data: { status, title }
      });

      const links = [
        ...(shipment.linkInbound || []).map(projectInboundMap),
        ...(shipment.linkOutbound || []).map(projectoutboundMap),
        ...(shipment.linkPriceRequest || []).map(priceRequestMap)
      ];

      return links;
    },
    hasItems: parent => {
      const shipmentId = parent.id;

      return ShipmentItem._collection.find({ shipmentId }).count() > 0;
    },

    // optional post-filter on nestedItems based on gql query
    // items should have been queried for
    nestedItems: (shipment = {}, args) => {
      if (!args) return shipment.nestedItems;
      const { types: tFilter, depth: dFilter } = args;
      return (shipment.nestedItems || []).filter(
        ({ type, level }) =>
          (tFilter ? tFilter.includes(type) : true) &&
          (dFilter ? level < dFilter : true)
      );
    }
  },

  Query: {
    async getShipmentById(root, args, context) {
      try {
        const { loaders, userId } = context;
        SecurityChecks.checkLoggedIn(userId);

        debug("getShipmentById %o", { args });

        // const shipment = Shipment.first(args.shipmentId);
        // const stringifiedShipment = stringifyBlackbox(shipment);

        return loaders.shipmentLoader.load(args.shipmentId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipment(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await getShipment({ accountId, userId }).get({
          shipmentId
        });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentTrackingInfo(root, args) {
      // without login!
      const { shipmentId } = args;
      return getShipmentTrackingInfo({}).get({ shipmentId });
    },
    async getShipmentInfoHeader(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await getShipmentInfoHeader({ accountId }).get({
          shipmentId
        });

        debug("getShipmentInfoHeader %o", data);
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentCostDetails(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId, invoiceId } = args;

        SecurityChecks.checkLoggedIn(userId);

        return getShipmentCosts({ accountId, userId }).get({
          shipmentId,
          invoiceId
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async getShipmentChanges(root, args, context) {
      const { accountId, userId } = context;
      const { shipmentId } = args;
      SecurityChecks.checkLoggedIn(userId);

      const data = await getShipmentChanges({ accountId }).get({
        shipmentId
      });

      return data;
    },

    async getShipmentDocuments(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await getShipmentDocuments({ accountId }).get({
          shipmentId
        });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentPartners(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await getShipmentPartners({ accountId }).get({
          shipmentId
        });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentLinks(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { shipmentId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await getShipmentLinks({ accountId }).get({
          shipmentId
        });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentInsights(root, args, context) {
      try {
        const { userId } = context;
        const { shipmentId } = args;
        debug("shipment.price.simulation for id %o ", shipmentId);
        SecurityChecks.checkLoggedIn(userId);

        const shipment = await Shipment.first(
          {
            _id: shipmentId
          },
          { fields: { simulation: 1 } }
        );

        // simulation is not part of the schema and is erased on each update
        if (shipment && shipment.simulation) {
          debug("return existing simulation %o", shipment);

          // simulation has run already, no need to rerun
          return {
            air: get(shipment, ["simulation", "result", "air", "results"]),
            ocean: get(shipment, ["simulation", "result", "sea", "results"]),
            road: get(shipment, ["simulation", "result", "road", "results"])
          };
        }
        debug(
          "call cloud for simulation, will save result on shipment for next time"
        );
        const res = await callCloudFunction(
          "Simulate",
          {
            shipmentId,
            top: true
          },
          context
        );

        return {
          air: get(res, ["result", "air", "results"]),
          ocean: get(res, ["result", "sea", "results"]),
          road: get(res, ["result", "road", "results"])
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentsForAddress(root, args, context) {
      const { userId, accountId } = context;
      const { addressId } = args;

      SecurityChecks.checkLoggedIn(userId);
      return getShipmentForAddress({ accountId, userId }).get({ addressId });
    },
    async getShipmentBillingInfo(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = getShipmentBillingInfo({ userId, accountId });
      await srv.init({ shipmentId });
      await srv.runChecks();
      return srv.get();
    }
  },

  Mutation: {
    async selectShipmentCarrier(root, args, context) {
      const { accountId, userId } = context;
      const { shipmentId, carrierId, priceListId, priceListResult } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await selectCarrier({ accountId, userId }).init({
          shipmentId
        });

        await srv.select({ priceListId, carrierId, priceListResult });
        const res = await srv.fetchReturnData();

        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updateShipmentTags(_, { shipmentId, tags }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const srv = updateTags({ accountId, userId });
      await srv.init({ shipmentId });
      await srv.update({ tags });
      return srv.getUIResponse();
    },
    async cancelShipment(root, args, context) {
      const { shipmentId } = args;
      const { userId, accountId } = context;

      try {
        debug("cancel shipment %s ", shipmentId);
        SecurityChecks.checkLoggedIn(userId);

        const srv = new ShipmentService({ accountId, userId });
        await srv.init({ shipmentId });
        await srv.checkPermission("cancelShipment");
        await srv.cancel();
        return pick(srv.get(), "id", "status");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async unCancelShipment(root, args, context) {
      const { shipmentId } = args;
      const { userId, accountId } = context;

      try {
        debug("uncancel shipment %s ", shipmentId);
        SecurityChecks.checkLoggedIn(userId);

        const srv = new ShipmentService({ accountId, userId });
        await srv.init({ shipmentId });
        await srv.checkPermission("unCancelShipment");
        await srv.unCancel();
        return pick(srv.get(), "id", "status");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updateShipment(root, args, context) {
      const { shipmentId, updates } = args;
      const { accountId, userId } = context;

      try {
        SecurityChecks.checkLoggedIn(userId);
        debug("shipment.update %s %j", shipmentId, updates);
        const srv = updateShipment({ accountId, userId });
        await srv.init({ shipmentId });
        await srv.update({ updates });
        const res = await srv.getClientResponse();
        debug("shipment.update %o", res);
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updateShipmentPartner(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId, partner, remove } = args.input;

      const srv = updatePartners({ accountId, userId });
      await srv.init({ shipmentId });
      await srv.update({ partner, remove });

      return srv.getUIResponse();
    },
    async resetShipmentCosts(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await resetShipmentCosts({ accountId, userId }).init({
          shipmentId
        });
        await srv.reset();
        const res = await srv.fetchReturnData();
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async approveDeclineShipmentCosts(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId, index, action, response } = args.input;
      debug("approve decline costs %o", args.input);

      SecurityChecks.checkLoggedIn(userId);

      const srv = await approveDeclineShipmentCosts({
        accountId,
        userId
      }).init({
        shipmentId,
        index
      });

      if (action === "approve") await srv.approve();
      if (action === "decline") await srv.decline({ response });

      return srv.fetchReturnData();
    },
    async editShipmentCosts(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId, index, invoiceCostIndex, cost } = args.input;

      debug("update shipment cost %o", args.input);

      try {
        SecurityChecks.checkLoggedIn(userId);

        const srv = await editShipmentCosts({
          accountId,
          userId
        }).init({
          shipmentId,
          index,
          invoiceCostIndex,
          cost
        });
        await srv.delegateAction();
        const res = await srv.fetchReturnData();
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async massActionShipment(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentIds, action } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = massAction({ accountId, userId });
        await srv.go({ shipmentIds, action });
        return srv.getResponse();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async duplicateShipment(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId, options } = args.input;

      debug("duplicateShipment %o", args.input);

      SecurityChecks.checkLoggedIn(userId);

      const srv = copyShipment({ accountId, userId });

      // FIXME: turn on checks:
      // await srv.runChecks();
      await srv.makeCopy({ shipmentId, options });
      await srv.notifications();
      return srv.get();
    },
    async createShipment(root, args, context) {
      const { userId, accountId } = context;
      const {
        pickup,
        delivery,
        projectType,
        projectId,
        isRequest
      } = args.input;

      debug("createShipment %o", args.input);

      try {
        SecurityChecks.checkLoggedIn(userId);

        const srv = createShipment({ accountId, userId });

        // FIXME: turn on checks:
        // await srv.runChecks()
        await srv.create({
          pickup,
          delivery,
          projectType,
          projectId,
          isRequest
        });
        await srv.addToProject();
        srv.triggerNotifications();
        return srv.get();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async unlinkPriceRequestFromShipment(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId } = args;

      debug("unlink priceRequest from shipmentId %o", shipmentId);
      SecurityChecks.checkLoggedIn(userId);

      const srv = unlinkPriceRequestFromShipment({ userId, accountId });
      await srv.init({ shipmentId });
      await srv.runChecks();
      await srv.unlink();
      return srv.getUIResponse();
    },

    /** simple change of address fields in shipment  */
    async updateShipmentLocation(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId, locationType, updates } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = updateShipmentLocation({ userId, accountId });
      await srv.init({ shipmentId });
      await srv.runChecks();
      await srv.updateLocation({
        locationType,
        updates
      });
      return srv.getUIResponse();
    },

    async confirmShipmentRequest(root, args, context) {
      const { userId, accountId } = context;
      const { shipmentId } = args;

      const srv = confirmShipmentRequest({ accountId, userId });
      await srv.init({ shipmentId });
      srv.runChecks();
      await srv.confirmRequest();
      srv.triggerNotifications();
      return srv.getUIResponse();
    }
  }
};
