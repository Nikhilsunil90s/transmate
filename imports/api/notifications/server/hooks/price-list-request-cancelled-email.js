import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

// TODO [#320]: userPreference check && mail to all users of carrier

JobManager.on(
  "price-list.request-cancelled",
  "EmailBuilder",
  async notification => {
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
        to: process.env.EMAIL_DEBUG_TO || carrier.getEmail(),
        subject: `A price list request was cancelled by ${customer.name}`,
        content: {
          text: `A price list request was cancelled by ${customer.name}`
        },
        tag: "priceList",
        accountId: priceList.customerId
      }).scheduleMail();
    }
    return "emails send";
  }
);
