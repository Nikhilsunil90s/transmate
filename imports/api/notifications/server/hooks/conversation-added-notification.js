/* eslint-disable no-restricted-syntax */
import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { User } from "/imports/api/users/User";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "conversation-added-notification";

// FIXME: Jan > is this correct?
JobManager.on("conversation.added", "sendEmails", async conversation => {
  const conversationObj = conversation.object;
  const author = await User.profile(conversationObj.created.by);

  for await (const participant of conversationObj.participants) {
    const user = await User.profile(participant);
    const text =
      (conversationObj &&
        conversationObj._id &&
        Meteor.absoluteUrl(`conversations/${conversationObj._id}`)) ||
      conversationObj.comment;
    if (user && (await checkUserPreference(PREFERENCE_KEY, "app", user._id))) {
      await new EmailBuilder({
        from: `${author} <conversation-${conversationObj._id}@messages.transmate.eu>`,
        to: process.env.EMAIL_DEBUG_TO || user.getEmail(),
        subject: `Transmate New Conversation (${conversationObj._id})`,
        content: { text },
        tag: "conversation"
      }).scheduleMail();
    }
  }
  return "all send";
});
