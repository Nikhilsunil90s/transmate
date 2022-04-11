import { DocTemplate } from "/imports/api/templates/Template";
import { createHtml } from "/imports/api/email/server/process-template.js";
import { getHBValues } from "/imports/api/templates/templateHelpers";
import { sendWithPostMark } from "/imports/api/email/server/send-postmark.js";
import { Meteor } from "meteor/meteor";

const debug = require("debug")("templates:startup");

const TEMPLATES_TO_CHECK = [
  { name: "stageConfirmationMail", accountId: "S70325" },
  { name: "stageConfirmationMail" },
  { name: "onboardingMail" },
  { name: "resetPasswordMail" },
  { name: "priceRequestUpdateMail" },
  { name: "priceListApprovedMail" },
  { name: "priceListNewMail" },
  { name: "shipmentEtaUpdateMail" },
  { name: "enrollMail" },
  { name: "accountConfirmationMail" },
  { name: "priceRequestMail", accountId: "S46614" },
  { name: "priceRequestMail" },
  { name: "notificationMail" },
  { name: "tenderMail" },
  { name: "portalInviteMail" }
];

export const templateCheck = async (sendTemplates = false) => {
  const ids = {};

  debug("templates to check", TEMPLATES_TO_CHECK.length);
  return Promise.all(
    TEMPLATES_TO_CHECK.map(async (template, index) => {
      let keys = [];
      let templateObj = {};

      try {
        templateObj = await DocTemplate.get({
          name: template.name,
          accountId: template.accountId || "someAccountId"
        });
        debug("check", template, templateObj.accountId);

        // check if we have the customer specific templates available!
        if (
          template.accountId &&
          template.accountId !== templateObj.accountId
        ) {
          TEMPLATES_TO_CHECK[
            index
          ].error = `no account sepcific template found for ${template.name} account: ${template.accountId}!`;
          return TEMPLATES_TO_CHECK[index];
        }
        if (!templateObj || !templateObj.template) {
          TEMPLATES_TO_CHECK[
            index
          ].error = `no template found for ${template.name} account: ${template.accountId}!`;
          return TEMPLATES_TO_CHECK[index];
        }
        if (ids[templateObj._id]) {
          TEMPLATES_TO_CHECK[index].error =
            "each template in array should give back an unique id";
          return TEMPLATES_TO_CHECK[index];
        }
        TEMPLATES_TO_CHECK[index].id = templateObj._id;
        ids[templateObj._id] = true;
        keys = getHBValues(templateObj.template);

        const result = createHtml({
          template: templateObj.template,
          data: keys
        });
        if (!result.html) {
          TEMPLATES_TO_CHECK[
            index
          ].error = `no html returned!${template.name} account: ${template.accountId}`;
          return TEMPLATES_TO_CHECK[index];
        }
        TEMPLATES_TO_CHECK[index].keys = keys;

        if (
          process.env.POSTMARK_KEY &&
          process.env.EMAIL_DEBUG_TO &&
          sendTemplates
        ) {
          debug(`template ${template.name} account: ${template.accountId}`);
          await sendWithPostMark({
            to: process.env.EMAIL_DEBUG_TO,
            subject: `TEST template ${template.name} account: ${template.accountId}`,
            text: result.text,
            html: result.html,
            tag: "mochaTest"
          });
        }

        return TEMPLATES_TO_CHECK[index];
      } catch (error) {
        TEMPLATES_TO_CHECK[index].error = error.message;
      } finally {
        if (templateObj && templateObj._id) {
          await DocTemplate._collection.update(
            { _id: templateObj._id },
            {
              $set: {
                keys: JSON.stringify(keys),
                checked: new Date(),
                error: TEMPLATES_TO_CHECK[index].error || null
              }
            }
          );
          // eslint-disable-next-line no-unsafe-finally
          return TEMPLATES_TO_CHECK[index];
        }
      }
      return null;
    })
  );
};

Meteor.startup(async function checkAllTemplates() {
  debug("check if templates exist and are ok on startup");
  const result = await templateCheck();
  if (result.some(el => (el || {}).error))
    console.error(
      "result checkAllTemplates errors:",
      result.filter(el => el.error)
    );
});
