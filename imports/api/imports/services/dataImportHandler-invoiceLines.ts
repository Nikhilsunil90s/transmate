import { DataImportInvoiceLines } from "./dataImportWorker-invoiceLines";

export const dataImportInvoiceLines = ({ accountId, userId }) => ({
  accountId,
  userId,

  async run({ data, importId, references }) {
    // SecurityChecks.checkLoggedIn(this.userId);
    // 0. get data from job call
    // 1. validate against schema
    // 2. store to db
    // 3. postBack

    const srv = new DataImportInvoiceLines({
      accountId,
      userId,
      importId
    }).initData({ data, references });
    await srv.getInvoiceDoc();
    await srv.matchShipment();
    srv.matchCost();
    await srv.parseInvoiceLine();
    const { shipmentId, warnings } = srv.get();

    return { shipmentId, warnings };
  }
});
