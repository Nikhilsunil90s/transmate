import { Invoice } from "../Invoice";
import { InvoiceQueryBuilder } from "./query.pipelineBuilder";

export const singleInvoice = ({ accountId }) => ({
  accountId,
  async get({ invoiceId }) {
    const invoiceQueryBuilder = new InvoiceQueryBuilder();
    const pipeline = invoiceQueryBuilder
      .queryInvoice({ _id: invoiceId })
      .getPartnerData("seller")
      .getPartnerData("client")
      .setCurrency()
      .getInvoiceItems()
      .getShipmentData()
      .getExchangeDate()
      .getExchangeRate()
      .calculateExchange()
      .calculateShipmentTotals()
      .calculateShipmentFlags()
      .removeShipmentDetails()
      .calculateInvoiceTotals()
      .calculateInvoiceFlags()
      .removeInvoiceDetails()
      .calculateDelta()
      .cleanView()
      .get();

    const res = await Invoice.aggregate(pipeline, { allowDiskUse: true });
    return res[0];
  }
});
