import { Invoice } from "../Invoice";

import {
  invoiceOverview,
  singleInvoice,
  uninvoicedShipments,
  addShipmentCostItem,
  invoiceService,
  getInvoiceReport,
  resetCurrencyExchangeRates
} from "../services";

import SecurityChecks from "/imports/utils/security/_security";

export const resolvers = {
  Query: {
    async getShipmentsWithoutInvoice(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { invoiceId } = args;

        SecurityChecks.checkLoggedIn(userId);

        const data = await uninvoicedShipments({ accountId }).get({
          invoiceId
        });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async getInvoiceOverview(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { filters } = args;

        SecurityChecks.checkLoggedIn(userId);
        const list = await invoiceOverview({ accountId }).get({ filters });

        return list;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async getInvoice(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { invoiceId } = args;

        SecurityChecks.checkLoggedIn(userId);
        const data = await singleInvoice({ accountId }).get({ invoiceId });

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getInvoiceReport(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { invoiceId, invoiceIds, carrierIds } = args.query;

      if (!invoiceId && !invoiceIds && !carrierIds)
        throw new Error("At least 1 query parameter should be set");

      const searchQuery = {
        ...(invoiceId && { _id: invoiceId }),
        ...(invoiceIds && { _id: { $in: invoiceIds } }),
        ...(carrierIds && { sellerId: { $in: carrierIds } })
      };

      const result = await getInvoiceReport({ accountId, userId }).get({
        searchQuery
      });

      return { result };
    }
  },
  Mutation: {
    async createInvoice(root, args, context) {
      const { userId, accountId } = context;
      const { partnerId, number, date, role } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      const srv = invoiceService({ accountId, userId });
      await srv.create({
        partnerId,
        number,
        date,
        role
      });

      return srv.getUIResponse();
    },
    async updateInvoice(root, args, context) {
      const { userId } = context;
      const { invoiceId, update } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const invoice = await Invoice.first(invoiceId);
      SecurityChecks.checkIfExists(invoice);

      // TODOsecurity checks here...

      return invoice.update_async(update);
    },
    async addShipmentCostItems(_, { input }, { userId, accountId }) {
      try {
        SecurityChecks.checkLoggedIn(userId);

        const { invoiceId, items = [] } = input;

        await addShipmentCostItem({ accountId, userId })
          .for({ invoiceId })
          .add({ items });

        return true;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async resetInvoiceCostMapping(root, args, context) {
      const { userId, accountId } = context;
      const { invoiceId } = args;
      SecurityChecks.checkLoggedIn(userId);

      const srv = invoiceService({ userId, accountId });
      await srv.init({ invoiceId });
      const updatedCostItems = await srv.resetCostMappings();
      return {
        id: invoiceId,
        costs: updatedCostItems
      };
    },
    async mapInvoiceCosts(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { invoiceId, updates } = args.input;

      const srv = invoiceService({ userId, accountId });
      srv.init({ invoiceId });

      // update mapping in invoice items:
      await srv.updateMappings({ newMappings: updates });

      // update mapping in invoice:
      await srv.resetCostMappings();

      // return something??
    },
    async resetCurrencyExchangeRatesFromInvoice(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { invoiceId, shipmentIds } = args.input;

      const srv = resetCurrencyExchangeRates({ userId, accountId });

      await srv.reset({ invoiceId, shipmentIds });
      return true;
    },

    // TODO: from where is this fetched??
    async recalculateInvoiceTotal(root, args, context) {
      const { userId, accountId } = context;
      const { invoiceId } = args;
      SecurityChecks.checkLoggedIn(userId);

      const srv = invoiceService({
        accountId,
        userId
      });
      srv.init({ invoiceId });
      await srv.calculateInvoiceTotal();

      return srv.getUIResponse();
    }
  }
};
