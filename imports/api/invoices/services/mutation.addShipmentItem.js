import { invoiceService } from "/imports/api/invoices/services/invoiceServices";

export const addShipmentCostItem = ({ accountId, userId }) => ({
  accountId,
  userId,
  for({ invoiceId }) {
    this.invoiceId = invoiceId;
    return this;
  },
  async add({ items }) {
    const srv = await invoiceService({
      accountId: this.accountId,
      userId: this.userId
    })
      .init({ invoiceId: this.invoiceId })
      .processShipmentItems({ items });

    await srv.calculateInvoiceTotal();

    return true;
  }
});
