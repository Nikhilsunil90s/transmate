import { UserStatus } from "meteor/mizzao:user-status";
import { UserActivity } from "../../UserActivity";
import { setUserLastActivityTS } from "./fn-setUserActivityTS";

const ONE_HOUR = 60 * 60 * 1000; /* ms */

// keep track of users in memory, if login is in the last 60 min don't register
const userLoginLogTimeStamp = {};

UserStatus.events.on(
  "connectionLogin",
  ({ userId, connectionId, ipAddr, ...data }) => {
    if (
      !userLoginLogTimeStamp[userId] ||
      new Date() - userLoginLogTimeStamp[userId] > ONE_HOUR
    ) {
      // set timestamp in memory
      userLoginLogTimeStamp[userId] = new Date();
      UserActivity.saveActivity({
        userId,
        activity: "login",
        data
      });
      setUserLastActivityTS({ userId });
    }
  }
);
