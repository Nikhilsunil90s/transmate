/* eslint-disable no-use-before-define */
import { JobManager } from "/imports/utils/server/job-manager.js";
import fetch from "@adobe/node-fetch-retry";
import get from "lodash.get";
import { DocTemplate } from "/imports/api/templates/Template";
import { Shipment } from "/imports/api/shipments/Shipment";
import { generateShipmentDocument } from "../../../documents/services/generateDocs.js";

import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { getShipmentStageReleaseData } from "/imports/api/shipments/services/query.getShipmentStageReleaseData";
import { objAssignDeep } from "/imports/utils/functions/fnObjectAssignDeep.js";
import { formatDateWithTimeZone } from "/imports/utils/functions/fnFormatDateWithTZ";
import { serializeSlateToHTMLString } from "/imports/utils/functions/fnSlateToHTML";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const debug = require("debug")("notifications:stage-relase:generateDoc");

const DOC_TEMPLATE_NAME = "stageConfirmation";
const MAIL_TEMPLATE_NAME = "stageConfirmationMail";
const PREFERENCE_KEY = "shipment-stage-released-generateDoc";

const getTimeZone = () => {}; // TODO

function getUrlAsBase64(url) {
  function checkStatus(res) {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    }
    throw Error("Get pdf, wrong status returned");
  }

  return new Promise((resolve, reject) => {
    fetch(url, { method: "GET", encoding: null })
      .then(checkStatus)
      .then(res => res.buffer())
      .then(buffer => {
        debug("we got the buffer back!");
        try {
          const base64File = buffer.toString("base64");
          resolve(base64File);
        } catch (e) {
          reject(e);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function prepareData(data) {
  // dates
  [
    {
      datePath: ["stage", "dates", "pickup", "arrival", "planned"],
      location: ["stage", "from"]
    },
    {
      datePath: ["stage", "dates", "delivery", "arrival", "planned"],
      location: ["stage", "to"]
    },
    {
      datePath: ["created", "at"],
      location: []
    }
  ].forEach(({ datePath, location }) => {
    if (get(data, datePath)) {
      const loc = get(data, location);
      const timeZone =
        (loc || {}).timeZone ||
        getTimeZone({
          location: {
            countryCode: (loc || {}).countryCode,
            latLng: (loc || {}).latLng
          }
        });

      const convertedValue = formatDateWithTimeZone(
        get(data, datePath),
        timeZone,
        { weekday: "short" }
      );

      objAssignDeep(data, convertedValue, datePath);
    }
  });

  // notes
  [
    ["stage", "from", "annotation", "hours"],
    ["stage", "to", "annotation", "hours"],
    ["stage", "from", "annotation", "safety", "instructions"],
    ["stage", "to", "annotation", "safety", "instructions"]
  ].forEach(path => {
    if (get(data, path)) {
      const convertedValue = serializeSlateToHTMLString(get(data, path));
      objAssignDeep(data, convertedValue, path);
    }
  });

  data.createdDate = new Intl.DateTimeFormat("en-GB").format(new Date());

  return data;
}

export const sendStageConfirmationHook = async ({
  shipmentId,
  stageId,
  accountId: accountIdHook,
  userId
}) => {
  const logging = { userCount: 0, mailCount: 0, mails: [] };

  // get data
  const { accountId: accountIdInShipment } =
    (await Shipment.first(shipmentId, { fields: { accountId: 1 } })) || {};

  const accountId = accountIdInShipment || accountIdHook;
  if (!accountId) throw Error("Could not find shipment & account in db");
  let data = await getShipmentStageReleaseData({ accountId }).get({
    shipmentId,
    stageId
  });

  if (!data) throw new Error("Shipment not found");

  // 0. prepare data (alters data object)
  data = prepareData(data);
  debug("create a pdf for %o", data);

  if (!data) throw Error("Could not get shipment data");

  // 1. create document & attach to shipment
  const doc = await generateShipmentDocument(
    {
      shipmentId,
      templateName: DOC_TEMPLATE_NAME,
      data,
      link: { shipmentId, stageId }
    },
    { accountId, userId }
  );

  if (!doc || !doc.url) throw Error("PDF document not generated!");
  debug("document url %o", doc.url);

  // 2. for each contact, send an email:
  debug("send email with pdf to carrier");

  const carrierId = get(data, "carrier.id");
  if (!carrierId) throw Error("No carrier found");

  const usersToContact = await AllAccounts.getUsers_async(carrierId, [
    "core-shipment-update",
    "core-shipment-create"
  ]);
  debug("check if users want an email", usersToContact.length);

  // filter the users to verify if they want to receive the notification:
  const filteredUsers = usersToContact.filter(user =>
    checkUserPreferenceDirect(PREFERENCE_KEY, "mail", user)
  );

  if (!filteredUsers.length)
    return { error: "No user with applicable notification settings found" };
  logging.userCount = filteredUsers.length;

  // get email template:
  const mailTemplate = await DocTemplate.get({
    name: MAIL_TEMPLATE_NAME,
    accountId
  });
  if (!(mailTemplate && mailTemplate.template))
    throw new Error(
      `No mail template: ${MAIL_TEMPLATE_NAME} found to send to users`
    );

  // prepare attachment data
  const attachmentData = await getUrlAsBase64(doc.url);
  const attachments = [
    {
      filename: `${DOC_TEMPLATE_NAME}_${shipmentId}_${stageId}.pdf`,
      content: attachmentData,
      contentType: "application/pdf",
      disposition: "attachment",
      contentId: shipmentId
    }
  ];

  await Promise.all(
    filteredUsers.map(async user => {
      debug("user wants an email for", DOC_TEMPLATE_NAME);

      // generate personalized message:
      const response = await callCloudFunction(
        "generateDoc",
        {
          template: Buffer.from(mailTemplate.template).toString("base64"),
          templateData: { ...data, user }
        },
        {
          userId,
          accountId
        }
      );
      const messageHTML = get(response, "result.html");
      debug("template generation response data: %o", !!messageHTML);
      if (!messageHTML) throw Error("no message generated");

      const message = Buffer.from(messageHTML, "base64").toString("utf8");

      const userEmail = user.getEmail();
      logging.message = message;
      logging.mailCount += 1;
      logging.mails.push(userEmail);

      const title = `Transmate shipment:${data.number}`;
      return new EmailBuilder({
        to: userEmail,
        subject: title,
        meta: {
          target: process.env.REPORTING_TARGET,
          type: "shipment",
          id: shipmentId,
          action: "stage-confirmation",
          userId: user._id,
          accountId: carrierId
        },
        tag: "shipment",
        content: { html: message },
        accountId,
        attachments
      }).scheduleMail();
    })
  );

  return logging;
};

// send delivery note to carrier
JobManager.on("shipment-stage.released", "Notification", async notification => {
  const { shipmentId, stageId, accountId, userId } = notification.object;
  return sendStageConfirmationHook({
    shipmentId,
    stageId,
    accountId,
    userId
  });
});

// example of data in query
/*

{
  "_id": "yL5eRW7XnM8E32Wyn",
  "number": "A5RPZN4X",
  "references": {
    "carrier": "test"
  },
  "id": "yL5eRW7XnM8E32Wyn",
  "stageCount": 1,
  "shipper": {
    "_id": "S65957",
    "name": "Globex",
    "type": "shipper",
    "id": "S65957"
  },
  "carrier": {
    "_id": "C11051",
    "name": "Carrier Beta",
    "type": "carrier",
    "id": "C11051",
    "annotation": {
      "accountId": "S65957",
      "profile": {
        "contacts": [
          {
            "type": "general",
            "userId": "vurn7xga9vXgSvjPr",
            "contactType": "general",
            "mail": "info@carrierbeta.com",
            "phone": "+32 2 5674345",
            "linkedId": "vurn7xga9vXgSvjPr"
          }
        ]
      },
      "coding": {}
    }
  },
  "entity": {
    "code": "test",
    "name": "Test entity",
    "address": "test address",
    "zipCode": "2600",
    "city": "Berchem",
    "country": "BE",
    "UID": "1234687",
    "registrationNumber": "156456",
    "EORI": "12487"
  },
  nestedItems: [
  {
    "_id": "WpuCRbkA9TjGRWGmG",
    "quantity": {
      "amount": 10,
      "code": "22G1"
    },
    "type": "TU",
    "level": 0,
    "weight_net": 1000,
    "weight_gross": 1200,
    "weight_unit": "kg",
    "id": "WpuCRbkA9TjGRWGmG"
  }
], 
  "accountId": "S65957",
  "stage": {
    "_id": "scnkEFNjnDJ7FWbH5",
    "sequence": 2,
    "to": {
      "latLng": {
        "lat": 40.3061528,
        "lng": -3.465709199999992
      },
      "countryCode": "ES",
      "zipCode": "28500",
      "name": "Globex Spain",
      "addressId": "WJNLceXYjFBdYL4YQ",
      "address": {
        "street": "Avenida de Madrid",
        "number": "43",
        "city": "Arganda del Rey",
        "state": "Comunidad de Madrid"
      },
      "isValidated": true,
      "annotation": {
        "id": "S65957",
        "name": "Globex Spain"
      }
    },
    "from": {
      "latLng": {
        "lat": 45.6813612,
        "lng": 4.949486900000011
      },
      "countryCode": "FR",
      "zipCode": "69780",
      "name": "Globex  Mions",
      "addressId": "EoeX3PEqCyXhiuyCW",
      "address": {
        "street": "Rue Paul Emile Victor",
        "number": "24",
        "city": "Mions",
        "state": "Auvergne-Rhône-Alpes"
      },
      "isValidated": true,
      "annotation": {
        "id": "S65957",
        "name": "Globex  Mions",
        "hours": "some text",  // converted from: '[{"children":[{"text":"some text here..."}]}]',
        "safety": { pbm: ["mouth", "eye","body"]}
      }
    },
    "dates": {
      "delivery": {
        "arrival": {
          "planned": "2020-09-04T06:00:00.000Z"
        }
      },
      "pickup": {
        "arrival": {
          "planned": "2020-09-03T06:00:00.000Z"
        }
      }
    },
    "carrierId": "C11051",
    "id": "scnkEFNjnDJ7FWbH5"
  },
  "planners": [
  {
    "_id": "Dsqp3CRYjFpF8rQbh",
    "id": "Dsqp3CRYjFpF8rQbh",
    "email": "philip@transmate.eu",
    "first": "philip",
    "last": "poppe",
    "role": "creator"
  }
]
}
*/
