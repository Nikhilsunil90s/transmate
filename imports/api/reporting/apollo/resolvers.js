import dot from "dot-object";
import { getPriceRequestForDownload } from "/imports/api/priceRequest/services/query.getPriceRequestsDL";
import publicReports from "../enums/publicReports.json";
import reportFilters from "../enums/reportFilters.json";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { reportingService } from "../services/reportingService";
import SecurityChecks from "/imports/utils/security/_security";

function camelCase(str) {
  return str
    .split(".")
    .reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));
}

const debug = require("debug")("apollo:resolvers:report");

export const resolvers = {
  Query: {
    // for download directly in overviews:
    async getReportData(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { topic, query } = args.input;

      try {
        let results = [];
        switch (topic) {
          case "priceRequest": {
            results = await getPriceRequestForDownload({
              userId,
              accountId
            }).get({
              query
            });
            break;
          }
          default:
            results = [];
        }

        const resultsCamel = results.map(row => {
          const res = {};
          Object.entries(dot.dot(row)).forEach(([k, v]) => {
            const newKey = camelCase(k);
            res[newKey] = v;
          });
          return res;
        });

        return { result: resultsCamel };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getReports(root, args, context) {
      try {
        const { accountId, userId } = context;
        SecurityChecks.checkLoggedIn(userId);

        const accountType = AllAccounts.getType(accountId);
        debug("getReports accountId? %o", accountId);

        // custom reports are stored in an array:
        const { customReports = [] } =
          (await AllAccountsSettings.first(accountId, {
            fields: {
              customReports: 1
            }
          })) || {};
        debug(
          "return public reports %o and custom reports %o",
          publicReports,
          customReports
        );
        let reports = [
          ...Object.entries(publicReports)
            .filter(
              ([, v]) =>
                !v.onlyAccountTypes || v.onlyAccountTypes.includes(accountType)
            )
            .map(([key, v]) => ({
              key,
              ...v,
              isPublic: true
            })),
          ...customReports
        ];
        reports = reports.map(report => {
          // set default filters based on table
          report.filterKeys =
            report.filterKeys || reportFilters[report.dataSetId];
          return report;
        });
        return reports;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getReportEmbedURL(root, { input }, context) {
      const { accountId, userId } = context;

      const { dataSetId, reportId, filters } = input;
      debug("getReportEmbedURL %o", {
        dataSetId,
        reportId,
        filters,
        accountId,
        userId
      });
      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = reportingService({ accountId, userId }).generateSessionId();
        await srv.setupDb({ dataSetId, reportId, filters });
        const sessionId = srv.getEmbedUrl();

        return sessionId;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getReportDownloadURL(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { dataSetId, filters } = args.input;

      const srv = reportingService({ userId, accountId }).generateSessionId();
      await srv.setupDb({ dataSetId, filters });
      return srv.getDownloadUrl();
    }
  }
};
