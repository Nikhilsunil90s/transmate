import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

// TODO [#322]: userPreference check && mail to all user of carrier

JobManager.on("price-list.requested", "EmailBuilder", async notification => {
  const priceList = notification.object;
  const customer = await AllAccounts.first({
    _id: priceList.customerId
  });
  const carrier = await AllAccounts.first({
    _id: priceList.carrierId
  });
  if (customer && carrier) {
    await new EmailBuilder({
      from: `${customer.name} - ${process.env.EMAIL_SEND_FROM}`,

      //   replyTo: `pr+${priceList._id}.${priceList.carrierId}@inbound.transmate.eu`, // todo: test and implement return emails and bids
      to: process.env.EMAIL_DEBUG_TO || carrier.getEmail(),
      subject: `Price list request in Transmate for ${customer.name}`,
      meta: {
        target: process.env.REPORTING_TARGET,
        accountId: priceList.carrierId,
        type: "pricelist",
        id: priceList._id,
        action: "request"
      },
      accountId: priceList.customerId,
      templateName: "priceListNewMail",
      tag: "priceList",
      data: {
        userName: carrier.name,
        partner: customer.name,
        link: Meteor.absoluteUrl(`price-list/${priceList._id}`)
      }
    }).scheduleMail();
    return "emails send";
  }
  return "no emails send";
});
