// meteor/email service
import { Settings } from "/imports/api/settings/Settings";

const nodemailer = require("nodemailer");

const debug = require("debug")("email:smtp");

export class sendWithSmtp {
  static async send({
    from = process.env.EMAIL_SEND_FROM || "no-reply@transmate.eu",
    to,
    subject,
    text,
    html,
    attachments,
    accountId
  }) {
    const smtpSettings = await Settings.first({ _id: "smtp" });
    debug("smtpSettings %o, use settings for %o", smtpSettings, accountId);
    const customerSettings =
      smtpSettings &&
      smtpSettings.customerSettings &&
      smtpSettings.customerSettings.find(el => el.accountId === accountId);
    const defaultSettings = smtpSettings && smtpSettings.default;
    const smtpAccount = customerSettings ||
      defaultSettings || {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          ...(await nodemailer.createTestAccount())
        }
      };
    debug("run smtp email with :%o", {
      customerSettings,
      defaultSettings,
      smtpAccount
    });

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(smtpAccount);

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
      attachments
    });

    debug("Message sent: %s", info.messageId);

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    if (process.env.NODE_ENV === "development") {
      console.log(
        "email URL: %o %s %s",
        nodemailer.getTestMessageUrl(info),
        subject,
        to
      );
    }
    return {
      result: "ok",
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };

    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
}
