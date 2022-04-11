import { AllAccounts } from "../AllAccounts";

export const updateAccount = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init() {
    this.account = await AllAccounts.first(this.accountId, {
      fields: { _id: 1 }
    });
    if (!this.account) throw new Error("Account not found!");

    // role checking here...

    return this;
  },
  async update({ updates }) {
    await this.account.update_async(updates);
  },
  getResponse() {
    return AllAccounts.first(this.accountId);
  }
});
