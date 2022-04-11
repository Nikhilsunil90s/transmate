import moment from "moment";
import { Meteor } from "meteor/meteor";
import TokenGenerationService from "../../allAccounts/server/tokenGeneationSrv.js";
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { User } from "/imports/api/users/User";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { buildNestedItems } from "/imports/api/items/items-helper";

const debug = require("debug")("sendgrid:price-request");

export const sendPriceRequestEmail = async ({
  user,
  bidder,
  type,
  accountId,
  accountName,
  priceRequest
}) => {
  debug("send price request email to bidder %s", bidder.name);
  if (!["request", "cancel", "suspend", "won", "lost"].includes(type)) {
    throw Error(`type is unknown!${type}`);
  }
  const route = {
    page: "priceRequestEdit",
    _id: priceRequest._id,
    section: "data"
  };
  const tokenString = await TokenGenerationService.generateToken(
    route,
    user._id,
    "login-redirect"
  );
  const token = Meteor.absoluteUrl(`login-token/${tokenString}`);

  // normal link
  const link = Meteor.absoluteUrl(`price-request/${priceRequest._id}/data`);

  // get extra shipment data
  const shipmentIds =
    (priceRequest.items || []).map(item => (item || {}).shipmentId) || [];

  // get shipment and item data
  // to do : limit data in those calls
  const shipments = await Promise.all(
    shipmentIds.map(async id => {
      const shipment = await Shipment.first(id);
      const items = shipment
        ? buildNestedItems(await shipment.getNestedItems())
        : undefined;
      return { ...shipment, items };
    })
  );
  const sender = await User.profile(priceRequest.requestedBy);

  // todo: check preference here:
  const subject = {
    request: `${accountName} Transport Price-Request ${priceRequest.title} started for ${bidder.name}`,
    suspend: `${accountName} Transport Price-Request ${priceRequest.title} suspended for ${bidder.name}`,
    cancel: `${accountName} Transport Price-Request ${priceRequest.title} cancelled for ${bidder.name}`,
    won: `${accountName} Transport Price-Request ${priceRequest.title} won for ${bidder.name}`,
    lost: `${accountName} Transport Price-Request ${priceRequest.title} lost for ${bidder.name}`
  };

  return new EmailBuilder({
    to: user.getEmail(),

    // from: sender.getEmail(),
    // replyTo: sender.getEmail(),
    subject: subject[type],
    templateName: "priceRequestMail",
    accountId,
    data: {
      to: {
        accountId: bidder._id || bidder.accountId,
        accountName: bidder.name,
        email: user.getEmail(),
        name: user.getName() === user.getEmail() ? bidder.name : user.getName()
      },
      from: {
        accountName,
        name: sender.getName(),
        email: sender.getEmail()
      },
      id: priceRequest._id,
      title: priceRequest.title,
      ref: PriceRequest.ref(priceRequest),
      dueDate: `${moment(priceRequest.dueDate).format("D MMMM HH")}h`,
      bidder: { name: bidder.name },
      customer: { name: accountName },
      request: type === "request",
      suspend: type === "suspend",
      cancel: type === "cancel",
      won: type === "won",
      lost: type === "lost",
      link,
      token,
      items: priceRequest.items,
      shipments
    },
    meta: {
      userId: user._id,
      accountId: bidder._id || bidder.accountId,
      type: "priceRequest",
      id: priceRequest._id,
      version: priceRequest.version
    }
  }).scheduleMail();
};
