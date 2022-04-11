export const publishFields = {
  _id: 1,
  name: 1,
  description: 1,
  logo: 1,
  banner: 1,
  profile: 1,
  userIds: 1,
  features: 1,
  entities: 1
};

export const publishMyFields = ({ accountId }) => ({
  fields: {
    ...publishFields,
    [`account.${accountId}`]: 1,
    partners: { $elemMatch: { accountId } },
    accounts: { $elemMatch: { accountId } }
  }
});
