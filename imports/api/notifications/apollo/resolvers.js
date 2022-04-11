import dot from "dot-object";
import { Notification } from "/imports/api/notifications/Notification";
import SecurityChecks from "/imports/utils/security/_security";

export const resolvers = {
  Query: {
    async getNotifications(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      return Notification.where(
        { userId, deleted: { $ne: true } },
        { sort: { created: -1 } }
      );
    }
  },
  Mutation: {
    async removeNotifications(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { ids } = args;
      const query = {
        _id: { $in: ids },
        userId
      };

      await Notification._collection.remove(query);
      return true;
    },
    async markNotificationsRead(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { type, events, data } = args.input;
      let query = {
        type,
        userId,
        event: { $in: events },
        read: { $exists: false }
      };

      // remove event filter if no fields are given in event
      if (events.length === 0) {
        delete query.event;
      }

      const queryData = dot.dot({ data });
      query = { ...query, ...queryData };

      await Notification._collection.update(
        query,
        { $set: { read: new Date() } },
        { multi: true }
      );
      return true;
    },
    async markAllNotificationsAsRead(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { notificationIds } = args.input;
      const query = {
        _id: { $in: notificationIds },
        read: { $exists: false }
      };
      await Notification._collection.update(
        query,
        { $set: { read: new Date() } },
        { multi: true }
      );
      return true;
    }
  }
};
