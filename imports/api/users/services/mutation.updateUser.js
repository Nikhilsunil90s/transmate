import dot from "dot-object";
import SecurityChecks from "/imports/utils/security/_security";
import { User } from "../User";

export const updateUser = ({ accountId, userId }) => ({
  accountId,
  userId, // logged in user
  async init({ userId: subjectId }) {
    this.subjectId = subjectId; // who are we altering
    this.user = await User.profile(subjectId);
    SecurityChecks.checkIfExists(this.user);
    return this;
  },
  async update({ updates }) {
    // ensure the user is not accidently erasing his profile:
    const { profile } = updates;
    if (!profile.first) throw new Error("First name required!");
    const fieldUpdates = dot.dot({ profile });
    await this.user.update_async(fieldUpdates);
    return this;
  },
  async updatePreferences({ updates = {} }) {
    const update = {};
    Object.entries(updates).forEach(([k, v]) => {
      update[`preferences.${k}`] = v;
    });
    await this.user.update_async(update);
    return this;
  },
  async updateViewPreference({ updates = {} }) {
    const update = {};
    Object.entries(updates).forEach(([k, v]) => {
      update[`preferences.${k}`] = v;
    });
    await this.user.update_async(update);
    return this;
  },
  getResponse() {
    return User.profile(this.subjectId);
  }
});
