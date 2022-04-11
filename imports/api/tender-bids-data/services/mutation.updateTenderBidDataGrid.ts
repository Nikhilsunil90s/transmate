// import asyncQueue from "async/queue";
import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security.js";
import { TenderBidDataMeta } from "/imports/api/tender-bids-data/TenderBidDataMeta";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { getTenderBidDataGrid } from "./query.getTenderBidDataGrid";
import { TenderBidDataChanges } from "/imports/api/tender-bids-data/TenderBidDataChanges";
import { changesAccumulator } from "./changesAccumulator";
import { GetCalculationRefValues } from "./getCalculationRefValues";
import { evaluateFormula, EvaluationResult } from "./evaluateFormula";
import { listFormulas, FormulaColumn } from "./fn.listFormulas";

import { fnContext } from "../../_interfaces/context";

const debug = require("debug")("tender-bids:method");

interface initProps {
  tenderBidId: string;
}

interface UpdateType {
  lineId: string;
  colKey?: string; // required but omit in Changes!
  cType?: string;
  newValue?: any;

  // | { amount: { value: number; unit: string }; formula?: string }
  // | { value: number; formula?: string }
  // | string;
  oldValue?: any;
}

interface updateProps {
  updates: UpdateType[];
}

// interface Changes extends UpdateType {
//   key: string;
//   userId: string;
//   ts: Date;
// }

interface UpdateTenderBidDataGrid {
  context: fnContext;
  affectedLineIds: Array<string>;
  tenderBidId: string;
  init: (a: initProps) => Promise<UpdateTenderBidDataGrid>;
  update: (a: updateProps) => Promise<UpdateTenderBidDataGrid>;
  runQueue?: (updates: any, updateFn: any) => Promise<UpdateTenderBidDataGrid>;
  getUIResponse: () => Promise<any>;
}

/*
// const QUEUE_SIZE = 50; // concurrent calculations
const initializeQueue = (resolve, reject, taskHandler) => {
  console.log("Starting up the queue");
  const myQueue = asyncQueue(taskHandler, QUEUE_SIZE);
  myQueue.drain(async () => {
    console.log("All the work has been done.");

    // run postAction
    resolve();
  });
  myQueue.error((err, { props }) => {
    console.error(`task experienced an error: ${props.workerDocumentId}`);
    return reject(err);
  });
  return myQueue;
};
*/

export const updateTenderBidDataGrid: (
  a: fnContext
) => UpdateTenderBidDataGrid = ({ accountId, userId }) => ({
  context: { accountId, userId },
  affectedLineIds: [],
  tenderBidId: null,
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    this.tenderBidDataMeta = await TenderBidDataMeta.first({ tenderBidId });
    SecurityChecks.checkIfExists(this.tenderBidDataMeta);

    this.dataBulkOp = TenderBidData._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    this.changesBulkOp = TenderBidDataChanges._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    return this;
  },

  // async runQueue(updates, updateFn) {
  //   await new Promise((resolve, reject) => {
  //     const myQueue = initializeQueue(resolve, reject, updateFn);
  //     return updates.forEach(update => {
  //       return myQueue.push(update);
  //     });
  //   });
  //   return this;
  // },
  async update({ updates }) {
    this.countChangeUpdates = 0;
    this.countDataUpdates = 0;
    const updateFn = async ({ lineId, ...update }) => {
      this.affectedLineIds.push(lineId);

      const changeAcc = changesAccumulator(
        this.tenderBid,
        lineId,
        this.context.userId
      );
      const doc = await TenderBidData.first({
        lineId,
        tenderBidId: this.tenderBidId
      });
      if (!doc) throw new Error("no doc?"); // throw error?

      // ref data for calculations:
      const calcRefFactory = new GetCalculationRefValues(doc.calculation);

      // TODO: if one relies on another column >> order
      // all formula columns, except the one that is being updated
      const allFormulaColumns: FormulaColumn[] =
        doc.calculation?.formulaColumns || [];
      const formulaColumnsToRecalculate = allFormulaColumns.filter(
        ({ colKey }) =>
          colKey !==
          (update.cType === "fillOut"
            ? `${update.colKey}.chargeValue`
            : update.colKey)
      );

      [update, ...formulaColumnsToRecalculate].forEach(
        ({ colKey, cType, newValue }: Omit<UpdateType, "lineId">, index) => {
          let formulaInUpdate: string;
          let evaluatedFormula: EvaluationResult;
          if (index === 0) {
            formulaInUpdate = newValue?.formula || null;

            // add/remove the column to the formulaColumns set:
            const formulaKey =
              cType === "fillOut" ? `${colKey}.chargeValue` : colKey;
            const updatedFormulaColumns: FormulaColumn[] = listFormulas(
              allFormulaColumns,
              formulaKey,
              cType,
              formulaInUpdate
            );

            changeAcc.add(
              "calculation.formulaColumns",
              updatedFormulaColumns,
              false
            );
          } else {
            formulaInUpdate = get(doc, `${colKey}.formula`);

            // formula ref is stored with the chargeValue in the key string
            // this causes issues in later updates
            colKey = colKey.replace(".chargeValue", "");
          }

          // if the cell has a formula > we need to evaluate the formula again
          if (formulaInUpdate) {
            evaluatedFormula = evaluateFormula(
              formulaInUpdate,
              calcRefFactory.refValues
            );
          }

          // update:
          if (cType === "calculationCharge") {
            // this type of field is added through automated calculation.
            // we allow users to modify the formulas

            // FIXME: when doing the 2nd pass we do not have this anymore !!!
            // the formula will be evaluated and can update the value
            // this depends then on the cType to which field it goes...
            let amountValue: number = newValue?.amount?.value;
            const amountUnit: string = newValue?.amount?.unit;
            if (evaluatedFormula) {
              amountValue = evaluatedFormula.result;

              if (evaluatedFormula.error) {
                changeAcc.add(
                  `${colKey}.errors`,
                  [evaluatedFormula.error],
                  false
                );
              }
            }

            if (amountUnit) {
              changeAcc.add(`${colKey}.amount.unit`, amountUnit, false);
            }
            calcRefFactory.add(colKey, amountValue);
            changeAcc.add(`${colKey}.amount.value`, amountValue, false);
            changeAcc.add(`${colKey}.formula`, formulaInUpdate, false); // stores "=(..)" or null
          } else if (cType === "calculationField") {
            const fieldUpdate = {
              value: newValue.value || newValue || 0,
              errors: null,
              formula: formulaInUpdate
            };
            if (evaluatedFormula) {
              fieldUpdate.value = evaluatedFormula.result;

              if (evaluatedFormula.error) {
                fieldUpdate.errors = [evaluatedFormula.error];
              }
            }
            calcRefFactory.add(colKey, fieldUpdate.value);
            changeAcc.add(`${colKey}`, fieldUpdate, false); // stores {value, unit}
          } else if (cType === "fillOut") {
            changeAcc.addCharge(
              `${colKey}.chargeValue`,
              {
                formula: formulaInUpdate,
                mapping: evaluatedFormula
                  ? evaluatedFormula.result
                  : newValue.amount?.value,
                errors: evaluatedFormula ? [evaluatedFormula.error] : []
              },
              true
            );

            if (newValue?.amount?.currency) {
              changeAcc.add(
                `${colKey}.chargeCurrency.mapping`,
                newValue.amount.currency,
                true
              );
            }
          } else {
            changeAcc.add(colKey, newValue, true);
          }
        }
      );

      this.countChangeUpdates += changeAcc.toChangesBulkop(this.changesBulkOp);
      this.countDataUpdates += changeAcc.toDataBulkop(this.dataBulkOp, {
        lineId,
        tenderBidId: this.tenderBidId
      });
    };

    // will fill the bulkops & run in parallel:
    // FIXME if we need to do with queue / stream > update here:
    // await this.runQueue(updates, updateFn);

    await Promise.all(updates.map(updateFn));

    return this;
  },
  async storeInDb() {
    try {
      const [dataResult] = await Promise.all([
        ...(this.countDataUpdates ? [this.dataBulkOp.execute()] : []),
        ...(this.countChangeUpdates ? [this.changesBulkOp.execute()] : [])
      ]);
      debug(dataResult);
    } catch (err) {
      console.error("error during bulkOp...", err);
      throw new Error("Could not save cell data");
    }
    return this;
  },
  async getUIResponse() {
    const srv = getTenderBidDataGrid(this.context);
    await srv.init({
      tenderBidId: this.tenderBidId,
      query: { lineId: { $in: this.affectedLineIds } }
    });
    const { projectedData } = await srv.convertToStructure().getRowData({});
    return projectedData;
  }
});
