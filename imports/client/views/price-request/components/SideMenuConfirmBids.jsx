import React from "react";
import { Segment, Button } from "semantic-ui-react";

// UI
const ConfirmBids = ({ confirmBids, hasBidsToConfirm, offerPending }) => {
  return hasBidsToConfirm ? (
    <Segment color="red" data-test="confirmBidWarning">
      <p>Make sure you confirm your bid to make it visible to the shipper.</p>
      <Button primary onClick={confirmBids} content="Confirm Bid" loading={offerPending} />
    </Segment>
  ) : null;
};

export default ConfirmBids;
