import SecurityChecks from "/imports/utils/security/_security.js";
import { TenderBidDataMeta } from "/imports/api/tender-bids-data/TenderBidDataMeta";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { fnContext } from "../../_interfaces/context";

interface UpdateTenderBidDataGrid {
  context: fnContext;
  lineIds: Array<string>;
  tenderBidId?: string;
  tenderBidDataMeta?: Array<any>;
  init: (a: { tenderBidId: string }) => Promise<UpdateTenderBidDataGrid>;
  getPriceListData: (a: {
    lineIds?: Array<string>;
    priceListId?: string;
  }) => Promise<UpdateTenderBidDataGrid>;
  getUIResponse: () => any;
}

export const generateTenderBidDataGridFromPriceList: (
  a: fnContext
) => UpdateTenderBidDataGrid = ({ accountId, userId }) => ({
  context: { accountId, userId },
  lineIds: [],
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    this.tenderBidDataMeta = await TenderBidDataMeta.first({ tenderBidId });
    SecurityChecks.checkIfExists(this.tenderBidDataMeta);

    return this;
  },
  async getPriceListData({ lineIds, priceListId }) {
    this.lineIds = lineIds;
    this.priceListId = priceListId;

    // does not need to be awaited for:
    // TODO: @jan, tie this up to function
    callCloudFunction(
      "runTenderBidFillOutDirect",
      {
        tenderBidId: this.tenderBidId,
        lineIds
      },
      { accountId, userId }
    );

    return this;
  },
  getUIResponse() {
    return {
      id: this.tenderBidId,
      worker: {
        isRunning: true,
        action: "calculating"
      }
    };
  }
});
