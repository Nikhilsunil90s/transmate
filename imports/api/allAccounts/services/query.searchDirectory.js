import { DirectorySearch } from "./directorySrv";
import { AllAccounts } from "../AllAccounts";

export const searchDirectory = ({ userId, accountId }) => ({
  userId,
  accountId,
  get({ filter, limit }) {
    const pipeline = new DirectorySearch({
      accountId: this.accountId,
      filter,
      limit
    })
      .search()
      .filterOnName()
      .filterOnService()
      .filterOnCertificate()
      .rankResults()
      .limitResults()
      .get();
    return AllAccounts._collection.aggregate(pipeline);
  }
});
