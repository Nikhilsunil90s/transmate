import { DataImportPartners } from "./dataImportWorker-partners";

export const dataImportPartner = ({ accountId, userId }) => ({
  accountId,
  userId,
  async run({ data, importId }) {
    // SecurityChecks.checkLoggedIn(this.userId);
    // 0. get data from job call
    // 1. validate against schema
    // 2. store to db
    // 3. postBack

    const srv = new DataImportPartners({
      accountId,
      userId,
      importId
    })
      .initData({ data })
      .transform();
    await srv.upsertPartner();
    await srv.setUpPartnership();
    await srv.updates();
    const { partnerId, name, warnings } = srv.get();

    return { partnerId, name, warnings };
  }
});
