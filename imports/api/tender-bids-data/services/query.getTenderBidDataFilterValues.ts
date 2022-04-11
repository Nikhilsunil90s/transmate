import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";

import { fnContext } from "../../_interfaces/context";

interface GetProps {
  tenderBidId: string;
  key: string;
}

interface GetTenderBidDataFilterValuesResponse {
  tenderBidId: string;
  key: string;
  values: string[];
}

interface GetTenderBidDataFilterValues {
  context: fnContext;
  tenderBidId?: string;
  get: (a: GetProps) => Promise<GetTenderBidDataFilterValues>;

  getUIResponse: () => GetTenderBidDataFilterValuesResponse;
}

export const getTenderBidDataFilterValues: (
  a: fnContext
) => GetTenderBidDataFilterValues = ({ accountId, userId }) => ({
  context: { accountId, userId },
  async get({ tenderBidId, key }) {
    this.tenderBidId = tenderBidId;
    this.key = key;
    this.values = await TenderBidData._collection
      .rawCollection()
      .distinct(`${key}.mapping`, { tenderBidId });
    return this;
  },

  getUIResponse() {
    return {
      id: this.tenderBidId,
      key: this.key,
      values: this.values
    };
  }
});
