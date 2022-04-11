import cryptoRandomString from "crypto-random-string";
import { User } from "../User";

export const setApiKeyForUser = ({ accountId, userId }) => ({
  accountId,
  userId,
  async set() {
    const apiKey = cryptoRandomString({ length: 20 });
    const user = await User.first(this.userId, { fields: { _id: 1 } });
    user.update({ "profile.apiKey": apiKey });
    return this;
  },
  getResponse() {
    return User.profile(userId);
  }
});
