import SecurityChecks from "/imports/utils/security/_security.js";
import { TenderBidDataMeta } from "/imports/api/tender-bids-data/TenderBidDataMeta";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { TenderBidDataChanges } from "/imports/api/tender-bids-data/TenderBidDataChanges";
import { fnContext } from "../../_interfaces/context";

interface ResetTenderBidDataGrid {
  context: fnContext;
  lineIds: Array<string>;
  tenderBidId?: string;
  tenderBidDataMeta?: Array<any>;
  init: (a: { tenderBidId: string }) => Promise<ResetTenderBidDataGrid>;
  reset: (a: { lineIds?: Array<string> }) => Promise<ResetTenderBidDataGrid>;
  getUIResponse: () => Promise<any>;
}

export const resetTenderBidDataGrid: (
  a: fnContext
) => ResetTenderBidDataGrid = ({ accountId, userId }) => ({
  context: { accountId, userId },
  lineIds: [],
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    this.tenderBidDataMeta = await TenderBidDataMeta.first({ tenderBidId });
    SecurityChecks.checkIfExists(this.tenderBidDataMeta);

    return this;
  },
  async reset({ lineIds }) {
    this.lineIds = lineIds;

    const chargeDescriptionFields = (
      this.tenderBidDataMeta.chargeDescriptionsSorted || []
    )
      .filter(({ k }) => k === "chargeDescription")
      .map(({ key }) => key);

    const promises = [
      TenderBidData._collection.update(
        {
          tenderBidId: this.tenderBidId,
          ...(lineIds.length ? { lineId: { $in: lineIds } } : {})
        },
        {
          $unset: {
            calculation: 1,
            statistics: 1,
            ...chargeDescriptionFields.reduce((acc: Object, key: string) => {
              acc[`${key}.chargeValue.mapping`] = 1;
              acc[`${key}.chargeValue.formula`] = 1;
              acc[`${key}.chargeValue.errors`] = 1;
              return acc;
            }, {})
          }
        },
        { multi: true }
      )
    ];

    if (!lineIds.length) {
      promises.push(
        this.tenderBidDataMeta.update_async({ calculationHeaders: [] })
      );
    }
    await Promise.all(promises);

    // FIXME: quick fix > remove all change entries >> modify this to capture the reset itself!
    // should add an entry for each resetted cell..
    TenderBidDataChanges._collection.remove(
      {
        tenderBidId: this.tenderBidId,
        ...(lineIds.length ? { lineId: { $in: lineIds } } : {})
      },
      { multi: true }
    );

    // TODO: fill the changes [] for each cell we have reset
    /*
    let lineIdsForChangesArray = lineIds;
    if (!lineIds?.length ) {
      const idObjArray: Array<{id:string, _id: string}> = await TenderBidData.where({tenderBidId: this.tenderBidId},{fields: {_id: 1}});
      lineIdsForChangesArray = idObjArray.map(({id})=> id    );
    }
    
    this.tenderBidDataMeta.push({ changes: { $each: lineIdsForChangesArray.map(lineId => ({newValue: updateValue,
      lineId,
      key: "...a lot of columns!",
      userId: this.context.userId,
      ts: new Date()})) } });
    */
    return this;
  },
  async getUIResponse() {
    return true;
  }
});
