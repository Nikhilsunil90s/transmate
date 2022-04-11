/* eslint-disable camelcase */

const debug = require("debug")("sendgrid");
const sgMail = require("@sendgrid/mail");

export const sendWithSendgrid = ({
  from,
  to,
  subject,
  text,
  html,
  attachments,
  tag,
  replyTo,
  meta
}) => {
  debug("send with sendgrid", to);
  if (!process.env.SENDGRID_KEY)
    return console.error("we can not use sendgrid without key");
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  const msg = {
    from: {
      email: from || process.env.EMAIL_SEND_FROM || "no-reply@transmate.eu"
    },
    to: {
      email:
        process.env.EMAIL_DEBUG_TO || to || "jan+NoToSpecified@transmate.eu"
    }, // principal email,
    reply_to: replyTo,
    categories: typeof tag === "string" ? [tag] : undefined,

    // hideWarnings: true,// now the warning won't be logged:Content with characters ', " or & may need to be escaped with three brackets
    subject,
    attachments,
    text,
    html,
    custom_args: { target: process.env.REPORTING_TARGET, link: meta },
    mail_settings: {
      sandbox_mode: {
        enable: process.env.EMAIL_DEBUG_TO
          ? false
          : process.env.SENDGRID_SANDBOXMODE === "true"
      }
    }
  };

  if (msg.mail_settings.sandbox_mode.enable)
    console.info("SANDBOXMODE ON: email will not be send!");
  debug("sendgrid email %o", msg);
  return sgMail.send(msg);
};
