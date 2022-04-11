import SecurityChecks from "/imports/utils/security/_security.js";
import { TenderBid } from "/imports/api//tender-bids/TenderBid";
import { TenderBidDataMeta } from "/imports/api/tender-bids-data/TenderBidDataMeta";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { TenderBidDataChanges } from "/imports/api/tender-bids-data/TenderBidDataChanges";
import { fnContext } from "../../_interfaces/context";
import { evaluateFormula } from "./evaluateFormula";
import { GetCalculationRefValues } from "./getCalculationRefValues";
import { changesAccumulator } from "./changesAccumulator";
import { listFormulas, FormulaColumn } from "./fn.listFormulas";

interface NewColumnInput {
  newColumnName: String;
  newColumnKey: String;
  defaultValue?: number;

  // add to bidColumn value
  operation?: "add" | "multiply" | "none";
  refColumn?: String;
}

interface InsertCalculationColumnGrid {
  context: fnContext;
  affectedLineIds: string[];
  tenderBidId?: string;
  tenderBidDataMeta?: Array<any>;
  init: (a: { tenderBidId: string }) => Promise<InsertCalculationColumnGrid>;
  insertColumn: (a: NewColumnInput) => Promise<InsertCalculationColumnGrid>;
  getUIResponse: () => Boolean;
}

export const insertCalculationColumnGrid: (
  a: fnContext
) => InsertCalculationColumnGrid = ({ accountId, userId }) => ({
  context: { accountId, userId },
  affectedLineIds: [],
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    this.tenderBidDataMeta = await TenderBidDataMeta.first(
      { tenderBidId },
      { fields: { calculationHeaders: 1 } }
    );
    SecurityChecks.checkIfExists(this.tenderBidDataMeta);

    // TODO: security checks

    // for client side active tracking
    const totalCount = await TenderBidData.count({ _id: tenderBidId });
    await TenderBid._collection.update(
      { _id: tenderBidId },
      {
        $set: {
          worker: { isRunning: true, current: 0, total: totalCount || 100 }
        }
      }
    );
    return this;
  },
  async insertColumn({
    newColumnName,
    newColumnKey,
    defaultValue,
    operation,
    refColumn
  }) {
    // 1. add the column to the header Definition (with a flag):
    await TenderBidDataMeta._collection.update(
      { tenderBidId: this.tenderBidId },
      {
        $push: {
          calculationHeaders: {
            leg: "main",
            label: newColumnName,
            name: newColumnKey,
            edit: true,
            group: "calculation",
            source: "calculation",
            type: "manualCharge",
            isManuallyAdded: true
          }
        }
      }
    );

    // 2. modify all the data items:
    // - add the column
    // - add to formula if applicable
    // - calculate the column formula

    const cursor = await TenderBidData.find({ tenderBidId: this.tenderBidId });
    const bulkOp = TenderBidData._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    const changesBulkOp = TenderBidDataChanges._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    let count = 0;

    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of cursor) {
      this.affectedLineIds.push(doc.lineId);
      const changeAcc = changesAccumulator(
        this.tenderBidId,
        doc.lineId,
        this.context.userId
      );

      // 1. value, currency or formula? -> to evaluate
      // it can be that it is a formula -> then we need to evaluate that first
      // assume it is a value for now -> try to convert to number if possible
      changeAcc.add(`calculation.manual.${newColumnKey}.value`, defaultValue);
      changeAcc.add(`calculation.manual.${newColumnKey}.operation`, operation);
      changeAcc.add(`calculation.manual.${newColumnKey}.refColumn`, refColumn);

      if (
        operation &&
        operation !== "none" &&
        Boolean(refColumn) &&
        Boolean(doc[refColumn]?.chargeValue)
      ) {
        // refColumn:
        const col = doc[refColumn].chargeValue;

        // FIXME: optionally -> if value is present, get that value in the column??
        let { formula }: { formula: string } = col;
        if (operation === "add" && Boolean(formula)) {
          formula += ` + [${newColumnKey}]`;
        }
        if (
          operation === "add" &&
          !Boolean(formula) &&
          Boolean(col.amount?.value)
        ) {
          formula = `= ${col.amount?.value} + [${newColumnKey}]`;
        }
        if (operation === "multiply" && Boolean(formula)) {
          formula = `(${formula}) * [${newColumnKey}]`;
        }

        if (formula) {
          const { result, error } = evaluateFormula(
            formula,
            new GetCalculationRefValues(doc.calculation, {
              [`${newColumnKey}`]: defaultValue
            }).refValues
          );

          const targetColumnKey = `${refColumn}.chargeValue`;
          changeAcc.addCharge(
            targetColumnKey,
            {
              formula,
              mapping: result,
              errors: [error]
            },
            true
          );

          // register formula if it wasnt done so:
          // we are targetting fillOut cells only
          const updatedFormulaColumns: FormulaColumn[] = listFormulas(
            doc.calculation?.formulaColumns || [],
            targetColumnKey,
            "fillOut",
            formula
          );
          changeAcc.add(
            "calculation.formulaColumns",
            updatedFormulaColumns,
            false
          );
        }
      }

      changeAcc.toChangesBulkop(changesBulkOp);

      changeAcc.toDataBulkop(bulkOp, {
        lineId: doc.lineId,
        tenderBidId: doc.tenderBidId
      });

      count += 1;
      await TenderBid._collection.update(
        { _id: this.tenderBidId },
        { $inc: { "worker.current": 1 } }
      );
    }

    if (count > 0) {
      try {
        await Promise.all([bulkOp.execute(), changesBulkOp.execute()]);
      } catch (e) {
        console.error(e);
      }
    }
    await TenderBid._collection.update(
      { _id: this.tenderBidId },
      { $set: { "worker.isRunning": false } }
    );

    return this;
  },
  getUIResponse() {
    return true;
  }
});
