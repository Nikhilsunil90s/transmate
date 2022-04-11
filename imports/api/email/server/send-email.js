/* eslint-disable max-classes-per-file */
// sendEmail or Email replacement
import { Meteor } from "meteor/meteor";
import { DocTemplate } from "/imports/api/templates/Template";
import { sendWithSmtp } from "/imports/api/email/server/send-smtp.js";
import { createHtml } from "./process-template";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { sendWithPostMark } from "/imports/api/email/server/send-postmark.js";
import { sendWithSendgrid } from "/imports/api/email/server/send-sendgrid.js";

// worker
import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "../../jobs/newJob";

const debug = require("debug")("email:send");

// FIXME: set a context??
export const flagMailSend = ({ msg, meta, email, tag, event }) => {
  return callCloudFunction("sendGridWebhook", {
    logArray: [
      {
        msg,
        link: meta,
        target: process.env.REPORTING_TARGET,
        event: event || "processed",
        timestamp: Date.now() / 1000,
        email,
        tag
      }
    ]
  });
};

// meta minimum :email, accountId, userId, type, id
// attachments:
// "name": "bacon.jpg",
// "content": "/9j/4AAQSkZJRgABAgEAAAAAAAD/4",
// "contentType": "image/jpeg", // !!!!!
// "contentID": "cid:part1.01030607.06070005@gmail.com"
/**
 * @param {{from?: string; to?: string,replyTo?: string, subject: string, templateName?: string, content?:any, attachments?: any, data?: any, meta?: any, tag?: string, accountId?: string, service?: string}} param0
 */
export class EmailBuilder {
  constructor({
    from = process.env.EMAIL_SEND_FROM || "no-reply@transmate.eu",
    to,
    replyTo = process.env.EMAIL_REPLY_TO || "info@transmate.eu",
    subject,
    templateName,
    content,
    attachments,
    data,
    meta,
    tag,
    accountId, // sender account
    service = process.env.MAIL_SERVICE || "console"
  }) {
    this.warnings = [];
    this.input = {
      from,
      to,
      replyTo,
      subject,
      templateName,
      content,
      attachments,
      data,
      meta,
      accountId,
      service,
      tag
    };
    debug("start email class with %o", this.input);
    return this;
  }

  async scheduleMail(secondsDelay = 0) {
    // check if we have enough data for the job
    if (
      !this.input.templateName &&
      !(this.input.content || {}).text &&
      !(this.input.content || {}).html
    ) {
      throw Error("no text / template to send!");
    }
    await newJob(EdiJobs, "process.email.send", {
      input: this.input
    })
      .delay(secondsDelay * 1000)
      .timeout(60 * 1000)
      .save();

    // return class for testing
    return { ok: true, sendClass: this };
  }

  async getTemplate({ templateName, accountId }) {
    if (
      typeof templateName === "string" ||
      typeof this.input.templateName === "string"
    ) {
      const name = templateName || this.input.templateName;

      // we will use the template to build the text and html
      const { _id, template, overwriteTo } = await DocTemplate.get({
        name,
        accountId: accountId || this.input.accountId
      });

      if (!template)
        throw new Error(`Email template ${name} not found in the database`);

      // for debugging
      this.input.overwriteTo = overwriteTo;
      debug("mail template received %o", _id);
      this.template = template;
      this.tag = this.tag || name || "default";
    } else {
      throw Error("no template given");
    }
    return this;
  }

  fillTemplate({ data, template }) {
    this.input.data = data || this.input.data || {};
    if (!this.input.data.logo) {
      this.input.data.logo =
        "https://assets.transmate.eu/emails/logo-transmate.png";
    }

    const { html, text } = createHtml({
      template: template || this.template,
      data: this.input.data
    });

    // overwrite content if any!
    this.input.content = { html, text };
    debug("template set!");
    return this;
  }

  // templateList = ["priceRequestUpdateMail", "resetPasswordMail"];
  async send({
    service = this.input.service,
    from = this.input.from,
    to = this.input.overwriteTo || process.env.EMAIL_DEBUG_TO || this.input.to,
    replyTo = this.input.replyTo,
    subject = this.input.subject,
    content = this.input.content,
    attachments = this.input.attachments,
    meta = this.input.meta,
    tag = this.tag
  }) {
    const { html, text } = content;
    if (typeof html !== "string" && typeof text !== "string")
      throw Error("no mail content found!");

    if (service === "postmark") {
      this.sendResult = await sendWithPostMark({
        from,
        to,
        replyTo,
        subject,
        text,
        html,
        attachments,
        tag,
        meta
      });
    } else if (service === "sendgrid") {
      this.sendResult = await sendWithSendgrid({
        from,
        to,
        replyTo,
        subject,
        text,
        html,
        attachments,
        tag,
        meta
      });
    } else if (service === "smtp") {
      // smtp does not like many requests per sec, so lets delay!
      // await new Promise(r => setTimeout(r, 1000));
      // todo : set SMTP server linked to account
      this.sendResult = await sendWithSmtp.send({
        from,
        to,
        replyTo,
        subject,
        text,
        html,
        attachments,
        accountId: this.input.accountId
      });
    } else if (service === "console") {
      this.sendResult = console.info(
        "email would be send",
        JSON.stringify({
          // from,
          to,

          // replyTo,
          subject

          // text

          // html,
          // attachments
        })
      );
    } else {
      throw Error(`wrong service selected ${service}`);
    }
    return this;
  }

  async flag(event) {
    // not blocking, lets just put a warning
    try {
      this.flagResult = await flagMailSend({
        msg: this.input.content.text,
        meta: this.input.meta,
        email: this.input.to,
        tag: this.tag,
        event
      });
    } catch (error) {
      this.warnings.push(`flag not set:${error.message}`);
    }

    return this;
  }

  async buildAndSend() {
    if (this.input.templateName) {
      await this.getTemplate({});
      this.fillTemplate({});
    }
    await this.send({});
    await this.flag("send");
    return { ok: true };
  }
}

// job to process mails
// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("EdiJobs process to do send mails.");
  return EdiJobs.processJobs(
    "process.email.send",
    {
      concurrency: 1,
      prefetch: 1
    },
    async (job, callback) => {
      const { input } = job.data || {};
      if (typeof input !== "object") {
        job.fail(`no data in input given`);
      }
      const emailJob = new EmailBuilder({ ...input });
      try {
        job.log(`start sending mail process`);

        // when templateName , run template setps
        if (input.templateName) {
          job.log(`get template:${input.templateName}`);
          await emailJob.getTemplate({});
          job.log(`fill template`);
          emailJob.fillTemplate({});
        }
        job.log(`send with:${input.service}`);
        await emailJob.send({});
        job.log(`flag`);
        const result = await emailJob.flag("send");
        if (Array.isArray(result.warnings))
          job.log(`warnings:${result.warnings.join(",")}`);
        job.done(`email send ${input.to}`);
      } catch (error) {
        console.error("ERROR during process.email.send:", error);
        await emailJob.flag("dropped");
        job.fail(`Error sending email: ${error.message}`);
      }

      return callback();
    }
  );
});
