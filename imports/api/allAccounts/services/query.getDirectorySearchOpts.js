import { AllAccounts } from "../AllAccounts";

export const getDirectorySearchOptions = ({ accountId, userId }) => ({
  accountId,
  userId,
  async getServices() {
    const res = await AllAccounts._collection.aggregate([
      { $match: { type: "carrier", "profile.services": { $exists: true } } },
      { $unwind: { path: "$profile.services" } },
      { $group: { _id: "$profile.services" } },
      { $sort: { _id: 1 } }
    ]);

    return res.map(({ _id }) => _id);
  },
  async getCertificates() {
    const res = await AllAccounts._collection.aggregate([
      {
        $match: { type: "carrier", "profile.certificates": { $exists: true } }
      },
      { $unwind: { path: "$profile.certificates" } },
      { $group: { _id: "$profile.certificates" } },
      { $sort: { _id: 1 } }
    ]);

    return res.map(({ _id }) => _id);
  }
});
