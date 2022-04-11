interface TenderBidChange {
  key: string;
  newValue?: number;
  formula?: string;
  errors?: string[];
  ts: Date;
  tenderBidId: string;
  lineId: string;
  userId: string;
}

interface ChangesAccumulator {
  tenderBidId: string;
  lineId: string;
  userId: string;
  updates: { [k: string]: any };
  changes: TenderBidChange[];
  add: (
    key: string,
    newValue: string | number | string[] | Object,
    toChanges?: boolean
  ) => void;
  addCharge: (
    key: string,
    val: { formula?: string; mapping?: number; errors?: string[] },
    toChanges?: boolean
  ) => void;
  toChangesBulkop: (this: ChangesAccumulator, changesBulkOp: any) => number;
  toDataBulkop: (
    this: ChangesAccumulator,
    changesBulkOp: any,
    query: { [k: string]: any }
  ) => number;
}

export const changesAccumulator: (
  tenderBidId: string,
  lineId: string,
  userId: string
) => ChangesAccumulator = (tenderBidId, lineId, userId) => ({
  tenderBidId,
  lineId,
  userId,
  updates: {},
  changes: [],
  add(key, newValue, toChanges) {
    this.updates[key] = newValue;
    if (toChanges) {
      this.changes.push({
        key,
        newValue,
        ts: new Date(),
        tenderBidId: this.tenderBidId,
        lineId: this.lineId,
        userId: this.userId
      });
    }
  },
  addCharge(key, { formula, mapping, errors }, toChanges) {
    this.updates[`${key}.formula`] = formula;
    this.updates[`${key}.mapping`] = mapping;
    this.updates[`${key}.errors`] = errors;

    if (toChanges) {
      this.changes.push({
        key,
        newValue: mapping,
        formula,
        errors,
        ts: new Date(),
        tenderBidId: this.tenderBidId,
        lineId: this.lineId,
        userId: this.userId
      });
    }
  },
  toChangesBulkop(changesBulkOp) {
    this.changes.forEach(change => changesBulkOp.insert(change));
    return this.changes.length;
  },
  toDataBulkop(dataBulkOp, query) {
    if (Object.keys(this.updates).length) {
      dataBulkOp.find(query).updateOne({ $set: this.updates });
      return 1;
    }
    return 0;
  }
});
