import omit from "lodash.omit";
import { AccountPortal } from "../AccountPortal";
import { checkPortalUser } from "./checkPortalUser";

const debug = require("debug")("AccountPortal");

export const portalService = ({ id, userKey }) => ({
  id,
  userKey,
  async getDoc(willBeModified) {
    this.profile = await AccountPortal.first(id);
    if (!this.profile) throw new Error("not-found", "Document not found in db");

    // keep original data in:
    if (!this.profile.original && willBeModified) {
      this.profile.update_async({
        original: omit(this.profile, [
          "_id",
          "id",
          "__is_new",
          "created",
          "updated"
        ])
      });
    }
    return this;
  },
  flagUserKey() {
    if (this.userKey) {
      this.contactIndex = checkPortalUser(this);
      if (this.contactIndex > -1) {
        this.activeUser = this.profile.contacts[this.contactIndex];

        // sets a flag that the user is a validated user
        this.profile.update_async({
          [`contacts.${this.contactIndex}.status`]: "validated"
        });
      }
    }
    return this;
  },

  // for edits:
  validateUserKey() {
    this.contactIndex = checkPortalUser(this);

    if (!(this.contactIndex > -1))
      throw new Error("not-authorized", "userKey not found in db");

    return this;
  },
  async update({ updates }) {
    if (updates.contacts) {
      const mailsInUpdate = updates.contacts.map(({ mail }) => mail);
      const updatedContacts = updates.contacts.map(contact => {
        const existingData = (this.profile.contacts || []).find(
          ({ mail }) => mail === contact.mail
        );
        return {
          ...existingData,
          ...contact
        };
      });

      // removed contacts:
      const removedContacts = (this.profile.contacts || [])
        .filter(({ mail }) => !mailsInUpdate.includes(mail))
        .map(contact => ({ ...contact, status: "doNotContact" }));

      updates.contacts = [...updatedContacts, ...removedContacts];
    }

    debug("updates %o", updates);
    await this.profile.update_async(updates);
    return this;
  },
  unsubscribe({ email }) {
    // flag
    this.profile.update_async({
      [`contacts.${this.contactIndex}.status`]: "doNotContact"
    });
    if (email) {
      this.profile.push({ contacts: { mail: email, status: "new" } });
    }
  },
  getUIResponse() {
    return this.profile.reload();
  }
});
