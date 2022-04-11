/* eslint-disable no-use-before-define */
import { Picker } from "meteor/meteorhacks:picker";
import bodyParser from "body-parser";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { processComment } from "/imports/api/conversations/services/processWebhookMessage";

function extractActualEmail(msg) {
  if (msg.indexOf("<") > -1) {
    const email = msg.slice(msg.indexOf("<") + 1, msg.indexOf(">"));
    return email;
  }
  return msg;
}

const webhookPicker = Picker.filter(req => {
  return req.method === "POST";
});

webhookPicker.middleware(bodyParser.json());
webhookPicker.middleware(bodyParser.urlencoded({ extended: true }));

/**
 * Here we will catch messages that are like this:
 * conversation-{id}@messages.transmate.eu
 */
webhookPicker.route("/webhooks/chat-message", (params, req, res) => {
  const postData = req.body;

  console.log("[Chat Webhook] Incomming Chat");
  console.log("---------");
  console.log(postData);
  console.log("---------");

  if (!postData) {
    console.error(
      `[Chat Webhook] We could not reliable extract postData from the request.`
    );

    return res.end(`Something went wrong`);
  }

  // https://documentation.mailgun.com/en/latest/api-sending.html#retrieving-stored-messages
  const textData = postData["stripped-text"];

  // const { attachments } = postData;

  // const signatureData = postData["stripped-signature"];
  const recipients = extractActualEmail(postData.recipients);
  const from = extractActualEmail(postData.from);

  // const subject = postData.recipients || [];
  const recipient = postData.recipient || recipients[0];

  // find conversation by id
  const [conversation] = recipient.split("@");

  // example ["pricerequest", "priceRequestId", "accountId", "userId"]
  const [documentType, documentId, meta1, meta2] = conversation.split("-");

  const sender = AllAccounts.findUserByEmail(from) || "unknown email address";
  processComment({
    senderId: sender._id,
    textData,
    documentType,
    documentId,
    meta1,
    meta2
  });

  return res.end();
});
