/* eslint-disable no-await-in-loop */

// process
// - check if full allocated or not,
// -- send update to bidders that participated

import { Meteor } from "meteor/meteor";
import { check } from "/imports/utils/check.js";
import get from "lodash.get";

import { getPriceRequestAccountsData } from "/imports/api/notifications/server/hooks/functions/get-price-request-accounts-data.js";
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { User } from "/imports/api/users/User";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

// worker
import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "../../jobs/newJob";

// import { getPartnerContacts } from "/imports/api/notifications/server/hooks/functions/get-partner-contacts.js";

const debug = require("debug")("price-request:overview");

const JOB_NAME = "process.price-request.mail.update";

function days(dateTime) {
  // debug(dateTime )
  try {
    return `${Math.floor(
      (new Date().getTime() - dateTime.getTime()) / (1000 * 3600 * 24)
    )}d`;
  } catch (e) {
    return undefined;
  }
}

export function getPrOverview({
  priceRequest,
  bidderAccountId,
  shipmentMetaData
}) {
  debug("find pr %o", {
    _id: priceRequest._id,
    "bidders.accountId": bidderAccountId
  });
  const bidderInfo = priceRequest.bidders.find(
    el => el.accountId === bidderAccountId
  );

  if (!bidderInfo) throw Error("accountId should match result!");

  // multiple items ,1  bidder, check what he has done

  const update = priceRequest.items.map(item => {
    // debug(item)
    // get bid,= won, lost...default pending
    // <day = now else show days since
    const bid = (bidderInfo.simpleBids || []).find(
      el => el.shipmentId === item.shipmentId
    );

    // debug("bid line %o", { item, bid });
    return { item, bid };
  });

  // debug("update line %o", update);

  // build table

  const overview = update.map(line => {
    let type;
    let ts;
    const keys = Object.keys(line.bid || {});
    debug("bid keys %o", keys);
    switch (true) {
      case keys.includes("won"):
        type = "won";
        ts = days(line.bid.won);
        break;
      case keys.includes("lost"):
        type = "lost";
        ts = days(line.bid.lost);
        break;
      case keys.includes("priceListId"):
        type = "pending";
        ts = days(new Date());
        break;
      default:
        type = "not offered";
        ts = days(new Date());
    }

    debug({ type, ts });
    const shipmentMeta =
      (shipmentMetaData || []).find(el => el._id === line.item.shipmentId) ||
      {};

    return {
      shipmentId: line.item.shipmentId,
      reference: get(shipmentMeta, "references.number", shipmentMeta.number),
      shipmentLink: Meteor.absoluteUrl(`shipment/${line.item.shipmentId}`),
      kg: get(line, "item.params.goods.quantity.kg"),
      from: get(line, "item.params.from.countryCode"),
      to: get(line, "item.params.to.countryCode"),
      type,
      ts
    };
  });

  const overviewStatus = {
    won: overview.every(({ type }) => type === "won"),
    lost: overview.every(({ type }) => type === "lost")
  };
  return { bidderAccountId, overview, overviewStatus };
}
export async function removeQueueFlag(_id) {
  await PriceRequest._collection.update(
    {
      _id,
      "bidders.simpleBids.queueMail": { $exists: true }
    },
    {
      $unset: { "bidders.$[bidder].simpleBids.$[bid].queueMail": "" }
    },

    {
      multi: true,
      arrayFilters: [
        { "bidder.simpleBids.queueMail": { $exists: true } },
        { "bid.queueMail": { $exists: true } }
      ]
    }
  );

  return true;
}

export class PriceRequestUpdateMail {
  constructor(priceRequestId, logging) {
    check(priceRequestId, String);
    debug("-PriceRequestUpdateMail class");
    const ts = Math.round(new Date().getTime());
    const last12Hours = new Date(ts - 12 * 3600 * 1000);
    const lastDay = new Date(ts - 24 * 3600 * 1000);

    Object.assign(this, {
      ts,
      last12Hours,
      lastDay,
      priceRequestId,
      process: false,
      overviews: [],
      logging: logging || []
    });
  }

  log(string) {
    this.logging.push(string);
  }

  async getData() {
    debug("--getData");
    debug("---get pr", this.priceRequestId);
    this.priceRequest = await PriceRequest.findOne(this.priceRequestId);
    debug("---get user", this.priceRequest.requestedBy);
    this.sender = await User.profile(this.priceRequest.requestedBy);
    this.log(`process :${this.priceRequestId}`);
    debug("---get shipments %o", this.shipmentIds);
    this.shipmentIds = this.priceRequest.items.map(el => el.shipmentId);
    debug("---get shipments %o", this.shipmentIds);
    this.shipmentMetaData = await Shipment.where(
      { _id: { $in: this.shipmentIds } },
      { fields: { number: 1, "references.number": 1 } }
    );
    return this;
  }

  checkAllocationStatus() {
    debug("--checkAllocationStatus");

    // check if all are allocated or not
    const shipmentIdsWon = [];
    const shipmentAllocationTimestamps = [];
    this.log(`--#bidders + ${(this.priceRequest.bidders || []).length}`);
    (this.priceRequest.bidders || []).forEach(bidder => {
      (bidder.simpleBids || []).forEach(simpleBid => {
        // debug(simpleBid)
        if (simpleBid.won) debug("  - won ", bidder.accountId, simpleBid.won);

        // check if we have a won for each of the shipments
        if (simpleBid.won && this.shipmentIds.includes(simpleBid.shipmentId)) {
          shipmentIdsWon.push(simpleBid.shipmentId);
          shipmentAllocationTimestamps.push(simpleBid.won);
        }
      });
    });
    this.shipmentIds.forEach(id => {
      this.log(
        `pr:${
          this.priceRequestId
        } : shipment:${id} won :${shipmentIdsWon.includes(id)}`
      );
    });
    this.shipmentIds.forEach(id => {
      this.log(
        `pr:${
          this.priceRequestId
        } : shipment:${id} won :${shipmentIdsWon.includes(id)}`
      );
    });

    // check if all shipments have a "won" flag if so send email right now.
    if (this.shipmentIds.length === shipmentIdsWon.length) {
      this.process = true;
      this.fullAllocation = true;
      debug("  -> SEND...all are allocated , flag process mail now!");
    } else if (
      shipmentAllocationTimestamps.length > 0 &&
      shipmentAllocationTimestamps.every(
        shipmentAllocationTimestamp =>
          shipmentAllocationTimestamp < this.last12Hours
      )
    ) {
      this.process = true;
      this.statusUpdate = true;
      debug(
        "  ->SEND...last update is 12H ago, send lost/pending mail now (flag process)!",
        shipmentAllocationTimestamps
      );
    } else if (
      this.priceRequest.dueDate < this.lastDay &&
      shipmentAllocationTimestamps.length === 0
    ) {
      this.process = true;
      this.statusUpdate = true;
      debug(
        "  ->SEND...due date past 1 day but no allocations, send pending mail now!",
        this.priceRequest.dueDate
      );
    } else {
      this.process = false;
      this.log("last timestamp is less than 12H ago! wait...");
      debug(
        "  -> WAIT...send mail if last update is 12H ago",
        shipmentAllocationTimestamps
      );
    }
    return this;
  }

  createOverviews() {
    debug("--createOverviews");
    if (this.process) {
      this.log(`create overviews :${this.priceRequestId}`);

      // create overview for each of the carriers that have participated in the bidding
      this.overviews = (this.priceRequest.bidders || [])
        .filter(el => el.bid)
        .map(bidder => {
          this.log(
            `pr:${this.priceRequestId} : create overview for participating carrier :${bidder.accountId}`
          );
          return getPrOverview({
            priceRequest: this.priceRequest,
            shipmentMetaData: this.shipmentMetaData,
            bidderAccountId: bidder.accountId
          });
        });

      debug("Overviews %o", this.overviews);
    }
    return this;
  }

  async createMailData() {
    debug("--createMailData");

    // remove flags
    if (this.process) {
      // only run sendmails if "process" is set
      await removeQueueFlag(this.priceRequestId);

      debug("update and mail needed");
      if (Array.isArray(this.overviews)) {
        const {
          customer = {},
          bidders,
          bidderUsers
        } = await getPriceRequestAccountsData(this.priceRequest);
        debug("send email to %o", bidderUsers.length);
        check(customer._id, String);
        check(bidders, Array);
        const { name: accountName, _id: accountId, logo } = customer;
        debug("bidders %o", bidders.length);
        this.emailData = [];
        const link = Meteor.absoluteUrl(
          `price-request/${this.priceRequest._id}/data`
        );
        this.overviews.map(overViewBidder => {
          // debug("overViewBidder %j", overViewBidder);

          const { overviewStatus = {}, bidderAccountId, overview } =
            overViewBidder || {};

          const { userIds, name: bidderName } =
            bidders.find(el => el.accountId === bidderAccountId) || {};
          let subject = `${accountName} Transport Price-Request ${this.priceRequest.title} Update for ${bidderName}`;
          if (overviewStatus.won) {
            subject = subject.concat(" (WON)");
          } else if (overviewStatus.lost) {
            subject = subject.concat(" (LOST)");
          }
          this.log(
            `check if email for #:${
              (userIds || []).length
            } userIds of account ${bidderAccountId}`
          );

          // only send to users that already have an id, don't create them here only at new price request (if needed)
          (userIds || []).map(userId => {
            const user = bidderUsers.find(el => el._id === userId);
            if (user && user.getEmail()) {
              const logLine = `send mail to ${userId} ${user.getEmail()} , subject:${subject}`;
              debug(logLine);
              this.log(logLine);
              const email = {
                to: user.getEmail(),
                accountId,
                tag: "pricerequest",
                templateName: "priceRequestUpdateMail",
                subject,
                data: {
                  link,
                  logo: logo ? `https:${logo}` : undefined,
                  id: this.priceRequest._id,
                  title: this.priceRequest.title,
                  from: {
                    accountName,
                    name:
                      this.sender.getName() === this.sender.getEmail()
                        ? accountName
                        : this.sender.getName(),
                    email: this.sender.getEmail()
                  },
                  to: {
                    bidderId: bidderAccountId,
                    name:
                      user.getName() === user.getEmail()
                        ? bidderName
                        : user.getName(),
                    bidderName
                  },
                  overview,
                  overviewStatus
                }
              };
              this.emailData.push(email);
              return true;
            }
            return false;
          });
          return true;
        });
        debug("send emails %o", this.emailData.length);
      }
    }

    // queue all mails (one per overview in array)
    return this;
  }

  async sendMails() {
    debug("--sendMails");
    if (this.process && this.emailData) {
      debug("---mails to send %o", this.emailData.length);

      // only run sendmails if "process" is set
      await removeQueueFlag(this.priceRequestId);
      this.mailResults = await Promise.all(
        this.emailData.map(msg => {
          // debug("mail data %j", msg);
          return new EmailBuilder(msg).scheduleMail();
        })
      );

      debug("---mailResults %o", this.mailResults);
    }
    return this;
  }

  async scheduleJob(secondsDelay = 0) {
    // check if we have enough data for the job
    if (!this.priceRequestId) {
      throw Error("no priceRequestId!");
    }
    newJob(EdiJobs, JOB_NAME, {
      priceRequestId: this.priceRequestId
    })
      .delay(secondsDelay * 1000)
      .timeout(60 * 1000)
      .save();

    // return class for testing
    return { ok: true, class: this };
  }

  async processMails() {
    debug("start PriceRequestUpdateMail processMails");
    await this.getData();

    this.checkAllocationStatus();

    await this.createOverviews();
    await this.createMailData();
    await this.sendMails();
    return this;
  }
}

// job to process mails
// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("add worker to create pr overviews.");
  return EdiJobs.processJobs(
    JOB_NAME,
    {
      concurrency: 1,
      prefetch: 1
    },
    async (job, callback) => {
      const { priceRequestId } = job.data || {};
      check(priceRequestId, String);
      try {
        job.log(`start sending mail process`);
        const log = [];
        debug("job:process start.", priceRequestId);
        const action = await new PriceRequestUpdateMail(
          priceRequestId,
          log
        ).processMails();
        debug("job:process finish.", priceRequestId);
        job.log("logging", { data: { log } });
        if (Array.isArray(action.warnings))
          job.log("warnings", {
            level: "warning",
            data: { warnings: action.warnings }
          });
        job.done({ overviews: JSON.parse(JSON.stringify(action.overviews)) });
      } catch (error) {
        job.fail(`Error sending email: ${error.message}`);
      }

      return callback();
    }
  );
});
