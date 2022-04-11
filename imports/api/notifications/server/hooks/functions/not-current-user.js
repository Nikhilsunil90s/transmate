export const notCurrentUser = (userId, currentUserId) => {
  return userId !== currentUserId;
};
