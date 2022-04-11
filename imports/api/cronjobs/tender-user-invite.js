/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { addCron } from "./cron";
import { TenderUsers } from "/imports/api/tender-users/tender-users.js";
import { Tender } from "/imports/api/tenders/Tender.js";

const debug = require("debug")("cron_tender");

addCron({
  name: "Invite tender users",
  logging: false,

  // schedule: "1 minutes",
  interval: 60,
  async job(cronLog = []) {
    try {
      const users = await TenderUsers.find({ notified: false });
      cronLog.push(`users to process:${users.count()}`);
      for await (const tenderUsersDoc of users) {
        debug("build invite for tenders");
        const tender = await Tender.first({ _id: tenderUsersDoc.tenderId });
        if (tender.status === "open") {
          // i.e it has been released
          cronLog.push(
            `invite users for tender ${
              tenderUsersDoc.tenderId
            } : ${tenderUsersDoc.userIds.join(",")}`
          );
          tenderUsersDoc.userIds.forEach(userId =>
            Accounts.sendEnrollmentEmail(userId)
          );
          await tenderUsersDoc.update({ notified: true });
        }
      }
      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
