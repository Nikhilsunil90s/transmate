export const getBidderEntry = ({ bidders = [], accountId: myAccountId }) => {
  const myBid =
    bidders.find(({ accountId }) => accountId === myAccountId) || {};

  return myBid;
};

export const getBidsForAccount = ({ bidders = [], accountId }) => {
  const myBid = getBidderEntry({ bidders, accountId });

  return myBid.simpleBids || [];
};

export const getBidForItem = ({ bids = [], shipmentId }) => {
  const bid = bids.find(({ shipmentId: shipId }) => shipId === shipmentId);
  return bid;
};

/** returns counter of bidders that have placed a bid on this item */
export const countBidDataForItem = ({ bidders = [], shipmentId }) => {
  const count = bidders.reduce((acc, bidder) => {
    let curCount = acc;
    const hasBid = !!bidder.simpleBids?.find(
      ({ shipmentId: shipId }) => shipId === shipmentId
    );
    if (hasBid) {
      curCount += 1;
    }
    return curCount;
  }, 0);
  return `${count} / ${bidders.length}`;
};

export const getWinningBidderForItem = ({ bidders = [], shipmentId }) => {
  const { accountId } =
    bidders.find(bidder =>
      (bidder.simpleBids || []).find(
        ({ shipmentId: shipId, won }) => shipId === shipmentId && won
      )
    ) || {};
  return accountId; // null or the accountId...
};
