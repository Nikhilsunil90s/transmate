import { JobManager } from "../../../utils/server/job-manager.js";

import { User } from "../User";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

export const upgradeRequest = ({ accountId, userId }) => ({
  accountId,
  userId,
  async post({ reference }) {
    const user = await User.profile(userId);
    const account = await AllAccounts.first(accountId);

    JobManager.post("upgrade.request", { account, reference, user });
  }
});
