import get from "lodash.get";
import { Random } from "/imports/utils/functions/random.js";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "/imports/api/roles/Roles";
import { AllAccounts } from "../AllAccounts";
import { publishMyFields } from "./fixtures";
import SecurityChecks from "/imports/utils/security/_security.js";
import { User } from "../../users/User";

const debug = require("debug")("allaccounts:service");

// TODO [#240]: when creating a user for a partner:
// 1. check if the mail already exists -> if so, then link it instead
// 2. security -> can a partner account stop another account from creating these users??
// 3. security -> first user of the account can be an admin, but the others ??

// IMPORTANT: the accounts array should be projected!!!
export const userContactService = ({ accountId, userId }) => ({
  accountId,
  userId,

  /** @param {{partner?: Object, partnerId: string; email: boolean}} param0 */
  async init({ partner, partnerId, email }) {
    this.partner =
      partner ||
      (await AllAccounts.first(
        partnerId,
        publishMyFields({ accountId: this.accountId })
      ));
    SecurityChecks.checkIfExists(this.partner);
    this.partnerId = partnerId || partner._id;
    this.mail = email;
    return this;
  },
  async createUser({ contact, options = {} }) {
    const token = Random.secret(16);
    debug("createUser %o", { contact, options, token });
    const { mail, email, firstName, lastName } = contact;
    this.contact = contact;
    this.mail = mail || email;
    this.contactUserId = await Accounts.createUser({
      email: mail || email,
      password: token,
      profile: {
        first: firstName,
        last: lastName
      },

      // introduction mail from automated job indicating a new user has been created:
      // to prevent it from running, the introductionEmail flag should be set to true
      ...(!options.sendWelcomeMail ? { introductionEmail: true } : undefined)
    });
    debug("user created %s", this.contactUserId);
    if (!this.contactUserId) throw new Error("could not create user in db");

    // store newUserId on account document:
    await Promise.all([
      this.partner.push({ userIds: this.contactUserId }, true),
      User._collection.update(
        { _id: this.contactUserId },
        { $addToSet: { accountIds: this.partnerId } }
      )
    ]);

    debug("add role %s", `account-${this.partnerId}`);

    // Link user
    // TODO [#241]: we are adding an admin in a linked account -> must check this!!!!
    await Roles.addUsersToRoles(
      this.contactUserId,
      ["admin"],
      `account-${this.partnerId}`
    );

    if (options.sendInvite) this.sendInvite();
    debug("createUser done %o", this.contactUserId);
    return this;
  },

  async createUserIfNotExists({ contact, options }) {
    // use email as unique id!
    if (!contact.mail) {
      throw Error("without email we can not create a user!");
    }

    const { _id, email } = await AllAccounts.findUserByEmail_async(
      contact.mail
    );

    this.mail = email; // set email as in db (capitals)
    this.contactUserId = _id;

    // to do : check if this is the correct way, risk of adding existing user to multiple accounts!
    // user does not exist, we need to invite
    if (!this.contactUserId) {
      debug("user needs to be created starting from this mail", contact.mail);
      try {
        await this.createUser({ contact, options });
      } catch (e) {
        console.error("error with contact", contact);
        throw e;
      }
    } else if (this.contactUserId && options.sendInvite) {
      // user exists, but we want to resend the invite...
      this.sendInvite();
    }

    return this;
  },

  async addToContacts() {
    // add the user info to my contacts in the profile of the newly created account:
    // 1. mail not found in the array => push
    // 2. mail found in the array => set
    debug(
      "addToContacts user %s to accountId %s",
      this.contactUserId,
      this.accountId
    );
    debug("this.partner  %o", this.partner);

    // IMPORTANT: accounts array should be projected!!!
    const contacts =
      get(this.partner, ["accounts", 0, "profile", "contacts"]) || [];
    debug("contacts of partner %s : %o", this.partner._id, contacts);
    const index = contacts.findIndex(({ mail }) => mail === this.mail);

    if (index > -1) {
      await AllAccounts._collection.update(
        { _id: this.partnerId, "accounts.accountId": this.accountId },
        {
          $set: {
            [`accounts.$.profile.contacts.${index}.linkedId`]: this
              .contactUserId
          }
        }
      );
    } else {
      await AllAccounts._collection.update(
        { _id: this.partnerId, "accounts.accountId": this.accountId },
        {
          $push: {
            "accounts.$.profile.contacts": {
              contactType: "general",
              linkedId: this.contactUserId,
              ...this.contact
            }
          }
        }
      );
    }
    debug(
      "contact %s added to partner %s ",
      this.contactUserId,
      this.partner._id
    );
    return this;
  },
  sendInvite() {
    // Send email with activation link (to set password)
    const { url } = Accounts.sendEnrollmentEmail(this.contactUserId);
    this.url = url;
  },

  get() {
    return { userId: this.contactUserId, url: this.url };
  }
});
