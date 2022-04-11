import { Invoice } from "../Invoice";
import { InvoiceQueryBuilder } from "./query.pipelineBuilder";

export const getInvoiceReport = ({ accountId, userId }) => ({
  accountId,
  userId,
  get({ searchQuery }) {
    // status: ['open']  #any status of invoice
    if (Object.keys(searchQuery).length === 0) {
      throw new Meteor.Error("no valid query parameters used");
    }

    // TODO: ensure the own accountId is added in the query >> data security!!
    const invoiceQueryBuilder = new InvoiceQueryBuilder();
    const pipeline = invoiceQueryBuilder
      .queryInvoice(searchQuery)
      .getPartnerData("seller")
      .setCurrency()
      .getInvoiceItems()
      .getShipmentData({
        edi: true,
        delivery: true,
        pickup: true
      })
      .setCalculatedLabelToShipmentCosts()
      .getExchangeDate()
      .getExchangeRate()
      .calculateExchange()
      .cleanReport()
      .get();
    return Invoice.aggregate(pipeline, {
      allowDiskUse: true
    });
  }
});
