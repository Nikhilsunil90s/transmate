import { User } from "../../User";

export const setUserLastActivityTS = ({ userId }) => {
  User._collection.update(
    { _id: userId },
    { $set: { lastActivity: new Date() } }
  );
};
