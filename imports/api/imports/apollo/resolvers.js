import SecurityChecks from "/imports/utils/security/_security";
import { Import } from "../Import-shipments";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import {
  updateShipmentImport,
  initializeMapping,
  insertRow,
  importDone,
  cancelImport,
  revertImport,
  restartImport,
  processImport
} from "../services/_mutations";
import { importService } from "../services/_importService";
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_IMPORT_TYPE,
  DEFAULT_NUMBER_FORMAT
} from "/imports/api/_jsonSchemas/enums/shipmentImport";

export const resolvers = {
  ShipmentImport: {
    rows(parent) {
      const importId = parent._id;
      if (parent.rows) return parent.rows;
      return EdiJobs.find(
        { "data.importId": importId },
        { fields: { data: 1, status: 1, result: 1, failures: 1, log: 1 } }
      ).fetch();
    }
  },
  ShipmentImportRow: {
    id(parent) {
      return parent._id;
    }
  },
  Query: {
    async getShipmentImport(root, args, context) {
      const { userId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);
      return Import.first(importId);
    },
    async getShipmentImportRows(root, args, context) {
      const { userId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);

      const imp = await Import.first(importId, {
        fields: { progress: 1, total: 1 }
      });
      const rows = await EdiJobs.find(
        { "data.importId": importId },
        { fields: { data: 1, status: 1, result: 1, failures: 1, log: 1 } }
      ).fetch();

      return {
        id: importId,
        progress: imp.progress,
        total: imp.total,
        rows
      };
    }
  },
  Mutation: {
    async createShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const defaultSetting = {
        numberFormat: DEFAULT_NUMBER_FORMAT,
        dateFormat: DEFAULT_DATE_FORMAT
      };
      const imp = await Import.create_async({
        settings: defaultSetting,
        accountId,
        type: DEFAULT_IMPORT_TYPE
      });
      return imp;
    },
    async updateShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId, updates } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = updateShipmentImport({ accountId, userId });
      await srv.init({ importId });
      await srv.update({ updates });
      await srv.checkValidationErrors();
      return srv.getUIResponse();
    },
    async initializeShipmentImportMapping(root, args, context) {
      const { userId, accountId } = context;
      const { importId, force } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = initializeMapping({ accountId, userId });
      await srv.init({ importId });
      await srv.initializeMapping(force);
      await srv.checkValidationErrors();
      return srv.getUIResponse();
    },
    async insertShipmentImportRow(root, args, context) {
      const { userId, accountId } = context;
      const { importId, i, data, headers, progress } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = insertRow({ accountId, userId });
      await srv.init({ importId });
      return srv.insert({ i, data, headers, progress });
    },
    async importDoneShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);
      const srv = importDone({ accountId, userId });
      await srv.init({ importId });
      await srv.flagDone();
      return srv.getUIResponse();
    },
    async cancelShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);
      const srv = cancelImport({ accountId, userId });
      await srv.init({ importId });
      await srv.cancel();
      return srv.getUIResponse();
    },
    async revertShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);
      const srv = revertImport({ accountId, userId });
      await srv.init({ importId });
      await srv.revert();
      return srv.getUIResponse();
    },
    async restartShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId } = args;
      SecurityChecks.checkLoggedIn(userId);
      const srv = restartImport({ accountId, userId });
      await srv.init({ importId });
      await srv.revert();
      return srv.getUIResponse();
    },
    async mapShipmentImportValue(root, args, context) {
      const { userId, accountId } = context;
      const { importId, header, importValue, systemValue } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = importService({ userId, accountId });
      await srv.init({ importId });
      return srv.mapValue({ header, importValue, systemValue });
    },
    async mapShipmentImportHeader(root, args, context) {
      const { userId, accountId } = context;
      const { importId, header, key } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = importService({ userId, accountId });
      await srv.init({ importId });
      await srv.mapHeader({ header, key });
      await srv.checkValidationErrors();
      return srv.getUIResponse();
    },
    async processShipmentImport(root, args, context) {
      const { userId, accountId } = context;
      const { importId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = processImport({ accountId, userId });
      await srv.init({ importId });
      srv.process(); // don't wait for this;

      return importId;
    }
  }
};
