import { DataImportAddress } from "./dataImportWorker-address";

export const dataImportAddres = ({ accountId, userId }) => ({
  accountId,
  userId,

  async run({ data, importId }) {
    // SecurityChecks.checkLoggedIn(this.userId);
    // 0. get data from job call
    // 1. validate against schema
    // 2. store to db
    // 3. postBack

    let res = new DataImportAddress({
      accountId,
      userId,
      importId
    })
      .initData({ data })
      .validate()
      .transform();

    res = await res.validateAddress();
    res = await res.addToAddressBook();
    res = await res.anotate();
    const { addressId, name, warnings } = res.get();

    return { addressId, name, warnings };
  }
});
