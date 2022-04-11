import { DataImportProcess } from "../services/dataImportProcess";
import SecurityChecks from "/imports/utils/security/_security.js";
import { ImportData } from "../ImportData";

export const resolvers = {
  Query: {
    async getDataImport(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { importId } = args;

      const res = await ImportData._collection.aggregate([
        { $match: { _id: importId } },
        {
          $lookup: {
            from: "jobs.edi.new",
            pipeline: [
              { $match: { $expr: { $eq: ["$data.importId", importId] } } },
              {
                $project: {
                  id: "$_id",
                  data: 1,
                  status: 1,
                  result: 1,
                  failures: 1,
                  log: 1
                }
              }
            ],
            as: "rows"
          }
        },
        { $addFields: { id: "$_id" } }
      ]);
      return res[0];
    }
  },
  Mutation: {
    async startDataImport(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { type, data, references } = args.input;

      // 0. store data in collection
      // 1. Transform data?
      // 2. Process data
      // 3. collect results & errors

      const srv = new DataImportProcess({
        userId,
        accountId,
        references: references || {},
        type
      });
      await srv.dbInit({ data });
      await srv.initiateProcess();
      const dataImportId = srv.get();

      return dataImportId;
    }
  }
};
