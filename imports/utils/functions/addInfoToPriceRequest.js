// required fields for priceRequest:
// dueDate, status
// requester, status,  wons, bids, biddersInRequest -> priceRequestInsights
export const PriceRequestEvaluation = class PriceRequestEvaluation {
  constructor(priceRequest) {
    // viewer = accountId (set messages for this account)
    this.priceRequest = priceRequest;
  }

  isExpired() {
    const dueBy = new Date(this.priceRequest.dueDate);
    this.expired = dueBy <= new Date();
    return this.expired;
  }

  /**
   * required fields:
   * status, dueDate
   * requester
   * bid, won, lost - projections if you are a carrier
   * @returns {{messageType: String, color: String, to: Object}}
   */
  statusMessage() {
    const priceRequest = this.priceRequest || {};
    const { requester, status } = priceRequest || {};
    let messageType = status; // default to status as fall back
    let color = "white";

    const isExpired = this.isExpired();
    if (requester) {
      // debug("bids and won for line", doc.status, { doc.bids, wons });
      const { wons, bids, biddersInRequest } = priceRequest || {};
      switch (true) {
        case status === "draft":
          messageType = "draft";
          color = "pink";
          break;
        case wons === 0 && status === "archived":
          messageType = "archived";
          color = "black";
          break;
        case wons > 0 && status === "archived":
          messageType = "allocated";
          color = "grey";
          break;
        case bids > 0 && bids === biddersInRequest && status === "requested":
          messageType = "allBidsReceived";
          color = "green";
          break;
        case bids > 0 && status === "requested":
          messageType = "partialBidsReceived";
          color = "yellow";
          break;
        case isExpired && status === "requested":
          messageType = "expired";
          color = "orange";
          break;
        default:

        // no change
      }
    } else {
      // carrier

      // eslint-disable-next-line no-fallthrough
      // check if carrier has placed a bid
      const { bid, won, lost } = priceRequest;

      // switch carrier view status to "for approval" if he placed a bid and the status of the request is still "requested"
      switch (true) {
        case bid && won && status === "archived":
          messageType = "won";
          color = "green";
          break;
        case bid && lost && status === "archived":
          messageType = "lost";
          color = "red";
          break;
        case bid && status === "requested":
          messageType = "offered";
          color = "yellow";
          break;
        case isExpired && status === "requested":
          messageType = "expired";
          color = "red";
          break;
        case !bid && status === "requested":
          messageType = "placeYourBid";
          color = "blue";
          break;
        default:

        // no change
      }
    }
    return { messageType, color, to: requester ? "requester" : "bidder" };
  }
};
