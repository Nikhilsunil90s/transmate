export const checkPortalUser = ({ userKey, profile = {} }) => {
  return (profile.contacts || []).findIndex(usr => usr.userKey === userKey);
};
