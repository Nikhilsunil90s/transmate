import { TenderBid } from "../../tender-bids/TenderBid";

export const getTenderBidMappings = ({ accountId, userId }) => ({
  accountId,
  userId,
  init({ tenderBidId }) {
    if (!tenderBidId) throw new Error("TenderBidId not set");
    this.tenderBidId = tenderBidId;
    return this;
  },
  async check() {
    this.tenderBid = await TenderBid.first(this.tenderBid, {
      fields: { status: 1, accountId: 1 }
    });
    if (!this.tenderBid) throw new Error("TenderBid not found");
    return this;
  },
  async get() {
    const arr = await TenderBid._collection.aggregate([
      { $match: { _id: this.tenderBidId } },
      { $project: { id: "$_id" } },
      {
        $lookup: {
          from: "tenders.bids.mapping",
          let: { tenderBidId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$tenderBidId", "$$tenderBidId"] } } },
            { $addFields: { id: "$_id" } }
          ],
          as: "mappings"
        }
      }
    ]);

    return arr[0];
  }
});
