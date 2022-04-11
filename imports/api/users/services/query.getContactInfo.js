import { User } from "../User";

export const getContactInfo = ({ accountId }) => ({
  accountId, // accountId of the caller
  async get({ userId }) {
    const userDoc = await User.profile(userId);
    if (!userDoc) return { id: userId };
    return {
      id: userDoc._id,
      email: userDoc.getEmail(),
      name: userDoc.getName(),
      avatar: userDoc.avatar()
    };
  }
});
