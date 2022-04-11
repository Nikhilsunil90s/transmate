import { AllAccounts } from "../../../../allAccounts/AllAccounts";
import { User } from "../../../../users/User";
import { userContactService } from "/imports/api/allAccounts/services/accountsUserService";

const validator = require("email-validator");

const debug = require("debug")("getPartnerContacts");

/**
 * this function will:
 * 1. look if a user contact has been selected for a partner
 * 2. if no user contact has been selected -> it will look it up in the contacts
 * 3. when contact has no linked userId -> it will create a user & send the invite.
 * 4. link the user to the contacts and store it in the contact list
 * @param {{accountId: string, partnerId: string, users?: Array<string>}} param0
 * @returns {Array} userObjects
 */
export const getPartnerContacts = async ({ accountId, partnerId, users }) => {
  if (!partnerId) throw Error("partnerId should be given!");
  let contacts;
  let usersWithIds = [];
  let usersWithoutIds = [];
  debug("get partner contacts :%o", { partnerId, users });
  // eslint-disable-next-line new-cap

  if (!users || users.length === 0) {
    debug(
      "no users identified for the partner %s -> lookup up in contacts",
      partnerId
    );
    const { generalProfile, profile } = await AllAccounts.getProfileData({
      accountId: partnerId,
      myAccountId: accountId
    });
    debug("profile for %s :%o %o", partnerId, profile, generalProfile);

    // if we would allow general profile:
    // ({ contacts } = profile || generalProfile || {});
    ({ contacts } = profile || {});
    debug("contacts :%o", contacts);
    if (Array.isArray(contacts) && contacts.length > 0) {
      // get valid emails from contact (profile) without ids
      usersWithoutIds = contacts.filter(
        contact =>
          !contact.linkedId && contact.mail && validator.validate(contact.mail)
      );

      // users that already have an id, only return ids
      usersWithIds = contacts
        .filter(contact => contact.linkedId)
        .map(({ linkedId }) => linkedId);

      // creates userIds and sends invites
      if (usersWithoutIds.length > 0) {
        await Promise.all(
          usersWithoutIds.map(async contact => {
            const srv = await userContactService({ accountId }).init({
              partnerId
            });
            await srv.createUserIfNotExists({
              contact,
              options: { sendInvite: true, sendWelcomeMail: false }
            });
            await srv.addToContacts();
            const { userId } = srv.get();
            usersWithIds.push(userId);
            return userId;
          })
        );
      }
    }
  } else {
    // users have been pre-selected: get ids from that array
    usersWithIds = users;
  }

  debug("usersWithoutIds :%o", usersWithoutIds);

  const userDocs = await User.where(
    { _id: { $in: usersWithIds } },
    { fields: { services: 0 } }
  );
  debug("return users %o, userDocs # %o", usersWithIds, userDocs.length);

  // usersWithoutIds is only informative, in case we want to know who we have sent an invite

  return { users: userDocs, usersWithoutIds };
};
