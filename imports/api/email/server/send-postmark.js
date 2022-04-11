const debug = require("debug")("email:send:postmark");
const postmark = require("postmark");

export const sendWithPostMark = ({
  from,
  to,
  replyTo,
  subject,
  text,
  html,
  attachments,
  tag,

  meta
}) => {
  debug("send email with postmark ", to);
  if (!process.env.POSTMARK_KEY)
    console.error("we can not use sendgrid without key");
  const client = new postmark.Client(process.env.POSTMARK_KEY);
  return client.sendEmail({
    From: from || process.env.EMAIL_SEND_FROM || "no-reply@transmate.eu",
    To: process.env.EMAIL_DEBUG_TO || to || "jan+NoToSpecified@transmate.eu", // principal email
    Subject: subject,
    TextBody: text,
    HtmlBody: html,
    Attachments: attachments,
    MessageStream: "app",
    Tag: tag,
    ReplyTo: replyTo || "info@transmate.eu",
    Metadata: { ...meta, target: process.env.REPORTING_TARGET }, // link in sendgrid
    TrackOpens: true,
    TrackLinks: "HtmlOnly"
  });
};

export const postmarkTest = async () => {
  const start = new Date().getTime();

  const client = new postmark.Client(process.env.POSTMARK_KEY);
  const response = await client.getSentCounts();

  if (response.Days)
    return {
      result: "OK",
      elapsed: new Date().getTime() - start
    };

  throw Error("not a valid return of postmark client");
};
