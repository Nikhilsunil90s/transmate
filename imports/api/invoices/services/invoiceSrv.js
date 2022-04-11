import { Invoice } from "/imports/api/invoices/Invoice";

export const invoiceSrv = ({ accountId, userId }) => ({
  accountId,
  userId,
  create({ partnerId, number, date, role }) {
    const data = {
      creatorId: this.accountId,
      number,
      date
    };

    if (role === "vendor") {
      // I am the vendor
      data.sellerId = accountId;
      data.clientId = partnerId;
    } else {
      // the other one is the vendor
      data.sellerId = partnerId;
      data.clientId = accountId;
    }

    return Invoice.create(data);
  }
});
