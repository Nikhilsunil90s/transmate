import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { Cost } from "/imports/api/costs/Cost";

export const updateSettingsCosts = ({ accountId, userId }) => ({
  accountId,
  userId,
  remove({ id }) {
    Cost._collection.remove({ _id: id, accountId: this.accountId });
    AllAccountsSettings._collection.update(
      { _id: this.accountId },
      { $pull: { costIds: id } }
    );
    return true;
  },
  async add(cost) {
    const newCost = await Cost.create({
      ...cost,
      type: "additional",
      accountId: this.accountId
    });

    AllAccountsSettings._collection.update(
      { _id: this.accountId },
      { $push: { costIds: newCost.id } }
    );
    return newCost.id;
  },
  update({ id, cost, group }) {
    Cost._collection.update(
      {
        _id: id,
        accountId: this.accountId
      },
      { $set: { cost, group } }
    );
    return id;
  },
  upsert(cost) {
    if (cost.id) return this.update(cost);
    return this.add(cost);
  }
});
