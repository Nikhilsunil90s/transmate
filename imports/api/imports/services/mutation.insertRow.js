import { Import } from "/imports/api/imports/Import-shipments";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import SecurityChecks from "/imports/utils/security/_security";

function isEmptyRow(dataRow) {
  return Object.entries(dataRow).every(v => !v);
}

export const insertRow = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId, { fields: { _id: 1 } });
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },
  async insert({ i, data, headers = null, progress = null }) {
    let update;

    if (headers || progress) {
      update = {};
      if (headers && headers.length) {
        update.headers = headers.map(Import.mongoKey);
      }
      if (progress) {
        update["progress.data"] = progress;
      }

      // By updating progress here (after the rows have actually been processed
      // by the backend), we make sure the number is correct
      await this.imp.update_async(update);
    }

    if (isEmptyRow(data)) return null;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== Import.mongoKey(key)) {
        data[Import.mongoKey(key)] = value;
        delete data[key];
      }
    });

    const row = await EdiRows.insert({
      importId: this.importId,
      i,
      data
    });

    return row._id;
  }
});
