import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

export const sendPriceListApproved = priceList => {
  const customer = AllAccounts.first({
    _id: priceList.customerId
  });
  const carrier = AllAccounts.first({
    _id: priceList.carrierId
  });
  if (customer && carrier) {
    return new EmailBuilder({
      from: `${customer.name} - ${process.env.EMAIL_SEND_FROM}`,
      to: process.env.EMAIL_DEBUG_TO || carrier.getEmail(),
      subject: `${customer.name} approved your price list`,
      templateName: "priceListApprovedMail",
      tag: "priceList",
      data: {
        userName: carrier.name,
        partner: customer.name,
        title: priceList.title || "",
        link: Meteor.absoluteUrl(`price-list/${priceList._id}`)
      },
      accountId: priceList.carrierId,
      meta: {
        target: process.env.REPORTING_TARGET,
        accountId: priceList.carrierId,
        type: "pricelist",
        id: priceList._id,
        action: "approved"
      }
    }).scheduleMail();
  }
  return "customer/carrier not found, email not send!";
};
