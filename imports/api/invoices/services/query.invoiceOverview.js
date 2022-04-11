import { Invoice } from "../Invoice";
import { InvoiceQueryBuilder } from "/imports/api/invoices/services/query.pipelineBuilder";

const debug = require("debug")("invoice:overview");

export const invoiceOverview = ({ accountId }) => ({
  accountId,
  fields: {
    id: "$_id",
    amount: 1,
    number: 1,
    status: 1,
    date: 1,
    sellerId: 1,
    seller: 1,
    clientId: 1,
    client: 1,
    creatorId: 1,
    itemCount: 1
  },

  async get({ filters = {} }) {
    const { partnerId, status } = filters;

    const pipeline = new InvoiceQueryBuilder()
      .queryInvoice({
        $and: [
          {
            $or: [
              {
                sellerId: this.accountId,
                ...(partnerId ? { clientId: partnerId } : undefined)
              },
              {
                clientId: this.accountId,
                ...(partnerId ? { sellerId: partnerId } : undefined)
              }
            ]
          },
          ...(status ? [{ status }] : [])
        ]
      })
      .getPartnerData("seller")
      .getPartnerData("client")
      .getItems()
      .getItemCount()
      .project({ fields: this.fields })
      .get();

    const list = await Invoice.aggregate(pipeline);

    debug(
      "invoice overview count: %o for filters: %o, firstItem %o",
      list.length,
      filters,
      list[0]
    );
    return list;
  }
});
