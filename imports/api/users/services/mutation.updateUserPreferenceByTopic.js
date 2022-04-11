import { User } from "../User";

export const updateUserPreferenceByTopic = ({ userId }) => ({
  userId,
  async init() {
    this.user = await User.profile(this.userId);
    if (!this.user) throw new Error("User not found");
    return this;
  },
  async setPreference({ topic, update: value }) {
    let update;
    switch (topic) {
      case "shipmentsView":
        update = {
          "preferences.views.shipments": value
        };
        break;
      default:
        update = undefined;
    }

    if (update) {
      await this.user.update_async(update);
    }
    return this;
  },
  async getUIResponse() {
    return this.user;
  }
});
