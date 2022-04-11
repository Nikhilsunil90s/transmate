/* eslint-disable consistent-return */
/* global Roles */
import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import SecurityChecks from "/imports/utils/security/_security";
import { pick } from "../../utils/functions/fnObjectPick";

import { AllAccounts } from "./AllAccounts";
import { Tender } from "../tenders/Tender";
import { TenderUsers } from "../tender-users/tender-users";

// const debug = require("debug")("method-account");

export const contactAccountAddUser = new ValidatedMethod({
  name: "account.contact.addUser",
  validate: new SimpleSchema({
    companyAccountId: {
      type: String
    },
    accountId: {
      type: String
    },
    tenderId: {
      type: String
    },
    props: {
      type: new SimpleSchema({
        email: {
          type: String
        },
        name: {
          type: String
        },
        role: {
          type: String,
          allowedValues: ["admin", "planner", "user"]
        }
      })
    }
  }).validator(),
  run({ accountId, props, companyAccountId, tenderId }) {
    let userId;
    SecurityChecks.checkLoggedIn(this.userId);

    // Check if the current user is an admin for this account
    if (
      !Roles.userIsInRole(
        this.userId,
        "admin",
        `account-${accountId}` ||
          Roles.userIsInRole(this.userId, ["admin"], Roles.GLOBAL_GROUP)
      )
    ) {
      throw new Meteor.Error(
        "account.contact.addUser.not-allowed",
        "You are not an admin."
      );
    }
    if (!this.isSimulation) {
      userId = Accounts.createUser({
        email: props.email,
        profile: pick(props, "name")
      });

      // Link user to account, with given role
      Roles.addUsersToRoles(userId, props.role, `account-${companyAccountId}`);

      // store in account doc:

      AllAccounts.first(companyAccountId).push({ userIds: userId }, true);

      const tender = Tender.first({ _id: tenderId });

      // Send immediately if tender is active
      if (tender.status !== "draft") {
        Accounts.sendEnrollmentEmail(userId);
      } else {
        // Add the to-be-notified users to a special collection for later notifications
        TenderUsers.notify_user({ userId, tenderId });
      }

      return { userId };
    }
  }
});
