/* eslint-disable no-use-before-define */
import React from "react";
import PropTypes from "prop-types";

import PriceRequestBiddingSimple from "./BiddingSimple.jsx";

const PriceRequestBiddingSimpleLoader = ({ ...props }) => {
  const { myBid = {}, shipmentId, bidTracker } = props;
  const { chargeLines = [], settings } = myBid || {};

  // keeps all modified bids and brings it to the tab component
  const onModifyBid = bid => {
    bidTracker({ shipmentId, bid });
  };

  return (
    <PriceRequestBiddingSimple
      {...props}
      chargeLines={chargeLines}
      settings={settings}
      bid={myBid}
      onModifyBid={onModifyBid}
    />
  );
};

PriceRequestBiddingSimpleLoader.propTypes = {
  myBid: PropTypes.object, // filtered bid for the current shimentId
  priceRequest: PropTypes.object,
  shipmentId: PropTypes.string,
  canBid: PropTypes.bool
};

export default PriceRequestBiddingSimpleLoader;
