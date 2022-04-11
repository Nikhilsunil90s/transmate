import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

export const partnerSearch = async ({ name, options, callerAccountId }) => {
  const { onlyNew } = options || {};

  const accounts = (
    await AllAccounts.where(
      {
        $and: [
          { $text: { $search: name, $caseSensitive: false } },
          ...(onlyNew
            ? [{ "partners.accountId": { $ne: callerAccountId } }]
            : [])
        ]
      },
      {
        fields: {
          name: 1,
          accounts: { $elemMatch: { accountId: callerAccountId } }
        },
        limit: 20
      }
    )
  ).map(partner => ({
    accountId: partner.id,
    name: partner.getName()
  }));

  return accounts;
};
