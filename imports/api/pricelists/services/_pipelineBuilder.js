import { PriceList } from "/imports/api/pricelists/PriceList";
import { getAccountInfo } from "/imports/utils/functions/pipelineHelpers/plGetAccountInfo";

const PRICELIST_FIELDS = {
  title: 1,
  type: 1,
  status: 1,
  customerId: 1,
  carrierId: 1,
  carrierName: 1,
  creatorId: 1,
  template: 1,
  currency: 1,
  category: 1,
  mode: 1,
  validFrom: 1,
  validTo: 1,
  uoms: 1,
  lanes: 1,
  volumes: 1,
  equipments: 1,

  shipments: 1,
  charges: 1,

  leadTimes: 1,
  defaultLeadTime: 1,
  attachments: 1,

  terms: 1,
  created: 1,
  updates: 1,
  fuelIndexId: 1,
  tenderId: 1,
  priceRequestId: 1,
  notes: 1,
  summary: 1,

  // projections
  customer: 1,
  carrier: 1
};

export const pipelineBuilder = ({ accountId, userId }) => ({
  accountId,
  userId,
  pipeline: [],
  match({ priceListId }) {
    this.pipeline.push({ $match: { _id: priceListId } });
    return this;
  },
  project({ fields = {} }, all) {
    const { carrier, customer } = fields;
    this.pipeline = [
      ...this.pipeline,
      ...(carrier || all
        ? getAccountInfo({
            partnerIdField: "$carrierId",
            accountId: "$creatorId",
            asField: "carrier",
            fields: { logo: 1 } // add the logo as well
          })
        : []),
      ...(customer || all
        ? getAccountInfo({
            partnerIdField: "$customerId",
            accountId: "$creatorId",
            asField: "customer"
          })
        : []),
      ...(all
        ? [{ $project: { id: "$_id", ...PRICELIST_FIELDS } }]
        : [{ $project: { id: "$_id", ...fields } }])
    ];
    return this;
  },
  async fetch() {
    const res = await PriceList._collection.aggregate(this.pipeline);
    return res[0];
  }
});
