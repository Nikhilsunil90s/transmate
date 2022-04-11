import SecurityChecks from "/imports/utils/security/_security";
import { Settings } from "../Settings";

const CLIENT_KEYS = ["tenderify-map"];
export const resolvers = {
  Query: {
    async getSettings(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { key } = args;
      if (!CLIENT_KEYS.includes(key))
        throw Error("this key is not availabble on the client!");
      return Settings.first({ _id: key });
    }
  }
};
