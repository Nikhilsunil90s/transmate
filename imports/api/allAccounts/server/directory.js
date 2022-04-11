/* eslint-disable consistent-return */
import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";

import SecurityChecks from "/imports/utils/security/_security";
import { DirectorySearch } from "../services/directorySrv";
import { CheckPartnershipSecurity } from "../../../utils/security/checkUserPermissionsForPartnerShip";
import { AllAccounts } from "../AllAccounts";
import { User } from "../../users/User";

export const query = new ValidatedMethod({
  name: "directory.query",
  validate: new SimpleSchema({
    filter: {
      type: Object,
      blackbox: true,
      optional: true
    },
    limit: {
      type: Number,
      optional: true
    }
  }).validator(),
  async run({ filter = {}, limit }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const accountId = await User.getAccountId();
    const pipeline = new DirectorySearch({ accountId, filter, limit })
      .search()
      .filterOnName()
      .filterOnService()
      .filterOnCertificate()
      .rankResults()
      .limitResults()
      .get();
    return AllAccounts._collection.aggregate(pipeline);
  }
});

export const updateProfile = new ValidatedMethod({
  name: "directory.profile.update",
  validate: new SimpleSchema({
    accountId: String,
    updates: {
      type: Object,
      optional: true,
      blackbox: true
    },
    pushes: {
      type: Object,
      optional: true,
      blackbox: true
    },
    invite: { type: Boolean, optional: true },
    tenderId: { type: String, optional: true }
  }).validator(),
  async run({
    accountId: partnerId,
    updates,
    pushes,
    invite = false,
    tenderId
  }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const partner = await AllAccounts.first({ _id: partnerId });
    const accountId = await User.getAccountId();

    new CheckPartnershipSecurity(
      { partner },
      { userId: this.userId, accountId }
    )
      .can({ action: "canAnnotatePartner" })
      .throw();
    let update;

    if (partner) {
      if (updates) {
        update = {};
        // eslint-disable-next-line array-callback-return
        Object.keys(updates).map(k => {
          update[`account.${accountId}.${k}`] = updates[k];
        });
        partner.update(update);
      }
      if (pushes) {
        update = {};
        // eslint-disable-next-line array-callback-return
        Object.keys(pushes).map(k => {
          update[`account.${accountId}.${k}`] = pushes[k];
        });
        partner.push(update);
      }
      if (invite) {
        if (
          Meteor.users.findOne({
            "emails.address": pushes["profile.contacts"].mail
          })
        ) {
          throw new Meteor.Error(
            "directory.profile.update",
            "Email already exists."
          );
        }
        Meteor.call(
          "account.contact.addUser",
          {
            accountId, // This is used to validated the method caller is an admin
            companyAccountId: accountId, // This is used to add user to a role
            tenderId,
            props: {
              email: pushes["profile.contacts"].mail,
              name: pushes["profile.contacts"].mail.split("@")[0],
              role: "user"
            }
          },
          err => {
            if (err) {
              throw new Meteor.Error("account.contact.addUser", err.reason);
            }
          }
        );
        return true;
      }
    } else {
      throw new Meteor.Error("not-found", "Document not found not found");
    }
  }
});
