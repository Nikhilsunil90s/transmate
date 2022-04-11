import { Roles } from "/imports/api/roles/Roles";
import { Accounts } from "meteor/accounts-base";
import { JobManager } from "../../../utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { AccountService } from "/imports/api/allAccounts/services/service";
import { User } from "../User";

import { DEFAULT_USER_NOTIFICATION_PREFERENCES } from "/imports/api/_jsonSchemas/enums/user";

const debug = require("debug")("user:service");

interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
}

interface AccountInput {
  id: string;
  company: string;
  type: string;
}

interface OptionsInput {
  sendMail?: boolean;
}

interface CreateUserServiceInput {
  user: UserInput;
  userId: string;
  options?: OptionsInput;
  accountInput?: AccountInput;
  accountId?: string;
}

interface CreateUserService {
  user: UserInput;
  userId: string;
  accountInput?: AccountInput;
  accountId?: string;
  accountModel?: any; // accountModel

  options: OptionsInput;

  /** if an account is created with an existing name: */
  existingName?: any;
  isNewAccount?: boolean;

  createUser: (this: CreateUserService) => Promise<CreateUserService>;
  initAccount: (this: CreateUserService) => Promise<CreateUserService>;
  addUserRoles: (this: CreateUserService) => Promise<CreateUserService>;
  triggerNotifications: (this: CreateUserService) => Promise<CreateUserService>;
  process: (this: CreateUserService) => Promise<CreateUserService>;
  getUserId: (this: CreateUserService) => Promise<string>;
  getAccountId: (this: CreateUserService) => Promise<string>;
}

export const createUserService = ({
  user,
  userId,
  accountInput,
  accountId,
  options = {}
}: CreateUserServiceInput): CreateUserService => ({
  user,
  userId,
  accountInput,
  accountId,
  options,
  async createUser() {
    debug("userid %s , createUserService %o", this.userId, this.user);
    if (!this.userId) {
      // only create user if userId is not given
      this.userId = await Accounts.createUser({
        email: this.user.email,
        profile: {
          first: (this.user.firstName || "").trim(),
          last: (this.user.lastName || "").trim()
        }
      });

      await User._collection.update(this.userId, {
        $set: {
          "preferences.notifications": DEFAULT_USER_NOTIFICATION_PREFERENCES
        }
      });
    }
    debug("userId %o", this.userId);
    return this;
  },
  async initAccount() {
    debug("initAccount %o", this.accountId);
    if (this.accountId) {
      this.accountModel = await AllAccounts.first(this.accountId);
    } else {
      const { company: name, type } = accountInput || {};

      this.accountId = await AccountService.generateAccountId(type);

      // other check we could to is email domain
      // const domain = this.user.email.split('@').slice(-1)[0] ;
      // check if .split('@'). exists already?
      this.existingName = await AllAccounts.first(
        { name },
        { fields: { id: 1 } }
      );
      if (this.existingName) {
        // dont block but send alert to admins
        new EmailBuilder({
          to: "info@transmate.eu",
          subject: `WARNING: New user created under same company name (${name})`,
          content: {
            text: `user ${this.user.email} (${this.userId}) has created an account ${this.accountId} with name ${name} 
            but this account name already exists under ${this.existingName._id}`
          },
          tag: "alert"
        }).scheduleMail();
      }

      debug("account id generated %o", this.accountId);
      this.accountModel = await AccountService.create({
        _id: this.accountId,
        name,
        type,
        created: { by: this.userId, at: new Date() }
      });
      this.isNewAccount = true;
    }

    // check
    if (!this.accountModel) throw new Error("account could not be initialized");

    // store the user in the account:
    debug("store the user %o", { userId: this.userId });
    await Promise.all([
      this.accountModel.push({ userIds: this.userId }, true),
      User._collection.update(
        { _id: this.userId },
        { $addToSet: { accountIds: this.accountId } }
      )
    ]);
    return this;
  },
  async addUserRoles() {
    debug(
      "addUserRoles account new? %o, account: %o, user: %o",
      this.isNewAccount,
      this.accountId,
      this.userId
    );
    if (this.isNewAccount) {
      // Add current user as admin
      await Roles.addUsersToRoles(
        this.userId,
        ["admin", "user"],
        `account-${this.accountId}`
      );

      // notify ourselves if an account has been created with user:
      JobManager.post("account.subscribed", {
        userId: this.userId,
        accountId: this.accountId
      });
    } else {
      await Roles.addUsersToRoles(
        this.userId,
        ["user"],
        `account-${this.accountId}`
      );
    }

    return this;
  },
  async triggerNotifications() {
    debug("send mail new? %o", options.sendMail);

    // Send email with activation link (to set password)
    if (options.sendMail || this.isNewAccount) {
      await Accounts.sendEnrollmentEmail(this.userId);
    }
    return this;
  },
  async process() {
    debug("start user process!");
    await this.createUser();
    await this.initAccount();
    await this.addUserRoles();
    await this.triggerNotifications();
    return this;
  },
  async getUserId() {
    await this.process();
    debug("return userId!");
    return this.userId;
  },
  async getAccountId() {
    await this.process();
    debug("return accountId! %o", this.accountId);
    return this.accountId;
  }
});
