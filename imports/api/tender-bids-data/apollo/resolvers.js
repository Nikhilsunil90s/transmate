import SecurityChecks from "/imports/utils/security/_security";

import { getTenderBidDataGrid } from "../services/query.getTenderBidDataGrid";
import { getTenderBidDataFilterValues } from "../services/query.getTenderBidDataFilterValues";
import { updateTenderBidDataGrid } from "../services/mutation.updateTenderBidDataGrid";
import { generateTenderBidDataGridFromPriceList } from "../services/mutation.generateTenderBidDataGridFromPriceList";
import { insertCalculationColumnGrid } from "../services/mutation.insertCalculationColumnGrid";
import { resetTenderBidDataGrid } from "../services/mutation.resetTenderBidDataGrid";

export const resolvers = {
  Query: {
    async getTenderBidDataGrid(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, filters, range } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      const srv = getTenderBidDataGrid({ accountId, userId });
      await srv.init({ tenderBidId, filters });
      srv.convertToStructure();
      await srv.getRowData({ range });
      return srv.getUIResponse();
    },
    async getTenderBidDataFilterValues(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, key } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = getTenderBidDataFilterValues({ accountId, userId });
      await srv.get({ tenderBidId, key });
      return srv.getUIResponse();
    }
  },
  Mutation: {
    async updateTenderBidDataGrid(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, updates } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = updateTenderBidDataGrid({ userId, accountId });
      await srv.init({ tenderBidId });
      await srv.update({ updates });
      await srv.storeInDb();
      return srv.getUIResponse();
    },
    async generateTenderBidDataGridFromPriceList(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, lineIds, priceListId } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = generateTenderBidDataGridFromPriceList({ userId, accountId });
      await srv.init({ tenderBidId });
      await srv.getPriceListData({ lineIds, priceListId });
      return srv.getUIResponse();
    },
    async resetTenderBidDataGrid(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, lineIds } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      try {
        const srv = resetTenderBidDataGrid({ userId, accountId });
        await srv.init({ tenderBidId });
        await srv.reset({ lineIds });
        return srv.getUIResponse();
      } catch (e) {
        console.error(e);
        return e;
      }
    },
    async insertCalculationColumnTenderBidDataGrid(root, args, context) {
      const { userId, accountId } = context;
      const {
        tenderBidId,
        newColumnName,
        newColumnKey,
        defaultValue,
        operation,
        refColumn,
        awaitResult // for testing we can make it sync
      } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = insertCalculationColumnGrid({
        userId,
        accountId
      });
      await srv.init({ tenderBidId });
      if (awaitResult) {
        await srv.insertColumn({
          newColumnName,
          newColumnKey,
          defaultValue,
          operation,
          refColumn
        });
      } else {
        srv.insertColumn({
          newColumnName,
          newColumnKey,
          defaultValue,
          operation,
          refColumn
        });
      }

      return true;
    }
  }
};
