import { UserStatus } from "meteor/mizzao:user-status";
import { UserActivity } from "../../UserActivity";
import { setUserLastActivityTS } from "./fn-setUserActivityTS";

UserStatus.events.on(
  "connectionActive",
  ({ userId, connectionId, ipAddr, ...data }) => {
    UserActivity.saveActivity({
      userId,
      activity: "connectionActive",
      data
    });

    setUserLastActivityTS({ userId });
  }
);
