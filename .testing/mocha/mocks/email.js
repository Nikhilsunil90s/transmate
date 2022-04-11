// meteor/email service
const nodemailer = require("nodemailer");
const {Meteor} = require("./meteor");
const debug = require("debug")("mock:email:smtp");
export class Email {
  static async send({
    from = process.env.EMAIL_SEND_FROM || "no-reply@transmate.eu",
    to,
    subject,
    text,
    html,
    attachments
  }) {
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
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
    console.log("email URL: %s %s %s", nodemailer.getTestMessageUrl(info), subject, to);
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
}
