/* eslint-disable no-await-in-loop */
import { v4 as uuidv4 } from "uuid";
import { Meteor } from "meteor/meteor";
import get from "lodash.get";
import { AccountPortal } from "../AccountPortal";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { addCron } from "../../cronjobs/cron";

const debug = require("debug")("accountPortal:emails");

// send first mails with sendgrid,
// reminders with postmark, wait 7 days after last email. send 3 reminders

export const setStatus = async (userKey, status) => {
  // with received token mark the email as confirmed
  debug("set portal contact status", userKey, status);
  return AccountPortal._collection.rawCollection().updateOne(
    { "contacts.userKey": userKey },
    {
      $set: { "contacts.$.status": status, "contacts.$.updated": new Date() }
    }
  );
};

export const getNextEmailContact = async () => {
  // not yet send = new
  // has email
  // not updated in one week
  // option : if domain exists, add info@ if no success and send
  const lastWeek = new Date(new Date() - 7 * 24 * 3600 * 1000);
  const { contacts, _id: portalId, name: companyName } =
    (await AccountPortal._collection.rawCollection().findOne(
      {
        contacts: {
          $elemMatch: {
            emailCount: { $lt: 3 },
            userKey: { $exists: true },
            mail: { $exists: true },
            valid: true,
            $or: [
              { updated: { $lt: lastWeek } },
              { updated: { $exists: false } }
            ],
            status: "new"
          }
        }
      },
      {
        fields: { "contacts.$": 1, name: 1 },
        sort: { emailCount: 1 } // get first companys that were contacted the least
      }
    )) || {};
  debug("getNextEmailContact contacts");

  // out of list take one with less emailcounts
  const contact = (contacts || []).sort(
    (a, b) => get(b, "emailCount", 0) - get(a, "emailCount", 0)
  )[0];
  if (!contact) return null; // will return null if not found
  return { ...contact, portalId, companyName };
};

export const incEmailCount = async userKey => {
  return AccountPortal._collection.rawCollection().updateOne(
    { "contacts.userKey": userKey },
    {
      $inc: { "contacts.$.emailCount": 1, emailCount: 1 },
      $set: { "contacts.$.updated": new Date() }
    }
  );
};

export const sendNextEmail = async log => {
  const contact = await getNextEmailContact();
  const result = {};
  debug("sendNextEmail to contact ?", contact);
  if (contact) {
    log.push(`send email to ${contact.mail}`);

    // app.transmate.eu/portal/<id>?userKey=<userKey>
    // app.transmate.eu/portal-unsubscribe/<id>?userKey=
    result.email = await new EmailBuilder({
      service: "sendgrid",
      from: `Tender System - ${process.env.EMAIL_SEND_FROM}`,
      to: contact.mail,
      subject: `Request for information to participate in future transport tenders`,
      meta: {
        bulk: true,
        userKey: contact.userKey,
        portalId: contact.portalId
      },
      templateName: "portalInviteMail",
      data: {
        ...contact,
        url: Meteor.absoluteUrl(
          `portal/${contact.portalId}?userKey=${contact.userKey}`
        ),
        unsubscribeUrl: Meteor.absoluteUrl(
          `portal-unsubscribe/${contact.portalId}?userKey=${contact.userKey}`
        )
      },
      tag: "portal"
    }).scheduleMail();

    // increase count
    await incEmailCount(contact.userKey);
  }
  return result;
};

// maintenance script, run before cron job
export const addContactUids = async log => {
  debug("process company contacts without uid");
  const companies = AccountPortal._collection.rawCollection().find({
    contacts: {
      $elemMatch: {
        userKey: { $exists: false },
        mail: { $exists: true }
      }
    }
  });
  debug("found %o companies", await companies.count());
  while (await companies.hasNext()) {
    const company = (await companies.next()) || {};
    const contacts = (company.contacts || []).map(contact => {
      if (!contact.userKey) {
        log.push(`update user ${contact.mail}`);
        debug("update user", contact.mail);
        contact.userKey = uuidv4();
      }
      return contact;
    });
    await AccountPortal._collection
      .rawCollection()
      .updateOne({ _id: company._id }, { $set: { contacts } });
  }
  return "done";
};

// cron for sending
// cron for uid

addCron({
  name: "AccountPortal create user uids",

  // schedule: "6 hours", // don't use 60 minutes , minutes only <60
  interval: 60 * 60 * 6,
  async job(cronLog = []) {
    try {
      cronLog.push("start");

      // always return fibers in synced cron
      debug("start cron to check users with exact info");
      const result = await addContactUids(cronLog);
      debug("end cron to check users with exact info %o", result);
      cronLog.push("finish");
      return { result: "done..." };
    } catch (error) {
      return { error: error.message };
    }
  }
});

addCron({
  name: "AccountPortal send emails",

  // schedule: "1 minutes", // don't use 60 minutes , minutes only <60
  interval: 60 * 5,
  async job(cronLog = []) {
    try {
      cronLog.push("start");

      // always return fibers in synced cron
      debug("start cron to check users with exact info");
      const result = await sendNextEmail(cronLog);
      debug("end cron to check users with exact info %o", result);
      cronLog.push("finish");
      return { result: "done..." };
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  }
});
