/* eslint-disable lines-between-class-members */
import { ImportData } from "../ImportData";
import { EdiJobs } from "../../jobs/Jobs";
import newJob from "../../jobs/newJob";

const debug = require("debug")("import:data");

// workflow:
// 0. from UI we get fileData -> store in import collection
// 1. run validations (optional)
// 2. start worker for each row
// 3. return _id to allow the redirect of the user to follow up

interface DataImportProcessInput {
  userId: string;
  accountId: string;
  type: "address" | "partners" | "invoice";
  references?: { invoiceId: string };
}
class DataImportProcess {
  userId: string;
  accountId: string;
  type: "address" | "partners" | "invoice";
  references: { invoiceId: string };
  importDocId: string;
  data: any;

  constructor({ userId, accountId, type, references }: DataImportProcessInput) {
    this.userId = userId;
    this.accountId = accountId;
    this.type = type;
    this.references = references;

    return this;
  }

  async dbInit({ data = [] }) {
    // filter out "" keys
    const modData = data.reduce((acc: Array<Object>, dataRow: Object) => {
      const modRow = {};
      Object.entries(dataRow).forEach(([key, val]) => {
        if (Boolean(val)) {
          modRow[key] = val;
        }
      });
      acc.push(modRow);
      return acc;
    }, []);

    this.data = modData;

    this.importDocId = await ImportData._collection.insert({
      type: this.type,
      data: this.data,
      accountId: this.accountId,
      references: this.references,
      userId: this.userId,
      errors: []
    });
    return this;
  }

  validateData() {
    // data validation here
    return this;
  }

  async initiateProcess() {
    // set up worker for each data element

    try {
      await Promise.all(
        (this.data || []).map(rowData =>
          newJob(EdiJobs, "process.method", {
            type: this.type,
            importId: this.importDocId,
            data: rowData,
            userId: this.userId,
            accountId: this.accountId,
            references: this.references
          })
            .timeout(30 * 1000)
            .save()
        )
      );
    } catch (error) {
      debug("error on import");
      throw error;
    }
    return this;
  }

  get() {
    return this.importDocId;
  }
}

export { DataImportProcess };
