import SecurityChecks from "/imports/utils/security/_security";
import {
  getPickingOverview,
  getPickingDetail,
  getShipmentLabelOptions,
  getDataForManifest
} from "../services/_queries";

import {
  cancelPackingLabel,
  packShipmentItems,
  printPickingList,
  printPickingManifest,
  confirmShipmentLabelOption
} from "../services/_mutations";

export const resolvers = {
  Query: {
    async getPickingOverview(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId, viewKey, filters } = args.input;

      const srv = await getPickingOverview(context).init({
        addressId,
        viewKey,
        filters
      });
      return srv.get();
    },
    async getPickingDetail(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId } = args;
      return getPickingDetail(context).get({ shipmentId });
    },
    async getShipmentLabelOptions(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { packingItemIds } = args;
      const srv = getShipmentLabelOptions(context);
      await srv.init({ packingItemIds });
      return srv.getOptions();
    },
    async getDataForManifest(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { addressId } = args;

      const srv = await getDataForManifest(context).init({
        addressId
      });
      return srv.get();
    }
  },
  Mutation: {
    async printPickingList(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId } = args;
      const srv = printPickingList(context);
      await srv.init({ shipmentId });
      await srv.generatePickingList();
      await srv.setShipmentStatus();
      return srv.getUIResponse();
    },
    async packShipmentItems(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId, parentItem, shipmentItemIds } = args.input;
      const srv = packShipmentItems(context);
      await srv.init({ shipmentId, shipmentItemIds });
      await srv.initializePackingUnit({ parentItem });
      await srv.mountItems();
      await srv.updatePickingStatus();
      const shipment = await srv.getUIResponse();
      const { result } = srv;

      return { shipment, result };
    },
    async unpackShipmentItems(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { packingUnitsIds } = args;
      const srv = packShipmentItems(context);
      await srv.unmountItems({ packingUnitsIds });
      await srv.updatePickingStatus();
      const shipment = await srv.getUIResponse();
      const { result } = srv;

      return { shipment, result };
    },
    async confirmShipmentLabelOption(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { packingItemIds, rateOptionId, rate } = args.input;
      const srv = confirmShipmentLabelOption(context);
      await srv.init({ packingItemIds });
      await srv.getCustomsValues();
      await srv.confirmOption({ rateOptionId, rate });
      await srv.storeLabelInfo();
      await srv.setShipmentAllocation();
      return srv.getUIResponse();
    },
    async cancelPackingLabel(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { packingItemIds, shipmentId } = args;
      const srv = cancelPackingLabel(context);
      await srv.init({ packingItemIds, shipmentId });
      await srv.cancelLabel();
      await srv.setShipmentAllocation();
      return srv.getUIResponse();
    },
    async printPickingManifest(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentIds } = args.input;

      const srv = printPickingManifest(context);
      await srv.init({ shipmentIds });
      await srv.setShipmentStart();
      return srv.getUIResponse();
    }
  }
};
